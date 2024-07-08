import './hackReadability'

import { Readability } from '@mozilla/readability'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const inlineTagNames = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  // 'br',
  'cite',
  'code',
  'dfn',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'tt',
  'u',
  'var',
])

/**
 * 判断是否需要获取iframe中的内容，在特殊的网站中，iframe中的内容才是我们需要的，例如：
 * outlook\icloud mail
 */
export const isNeedGetIframePageContent = () => {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (!url) {
    return false
  }
  return [
    'onedrive.live.com/edit.aspx',
    'icloud.com/mail',
    'navigator-lxa.mail.com/mail',
  ].find((website) => url.includes(website))
}

/**
 * 判断是否需要从特殊网站获取网页内容:
 */
export const isNeedGetSpecialHostPageContent = () => {
  const host = getCurrentDomainHost()
  return [
    'docs.google.com',
    'cnbc.com',
    'github.com',
    'timesofindia.indiatimes.com',
  ].find((item) => item === host)
}

export const getIframeOrSpecialHostPageContent = async (): Promise<string> => {
  let pageContent = ''
  if (isNeedGetIframePageContent()) {
    // 判断是不是需要从iframe获取网页内容: Microsoft word
    pageContent = await getIframePageContent()
  } else if (isNeedGetSpecialHostPageContent()) {
    // 判断是不是需要从特殊网站获取网页内容： google docs
    const host = getCurrentDomainHost()
    if (host === 'docs.google.com') {
      pageContent = await getGoogleDocPageContent()
    } else if (host === 'cnbc.com') {
      pageContent = await getCnbcPageContent()
    } else if (host === 'github.com') {
      pageContent = await getGithubPageContent()
    } else if (host === 'timesofindia.indiatimes.com') {
      const contentContainer = document.querySelector(
        '#app .nonAppView > .contentwrapper',
      ) as HTMLDivElement
      if (contentContainer) {
        pageContent = getFormattedTextFromNodes(
          getVisibleTextNodes(contentContainer),
        )
        // pageContent = contentContainer.innerText
      }
    }
  }
  return pageContent.trim()
}

/**
 * 获取可见文本节点
 * @param element
 * @param selectable 为true代表过滤掉无法选择的节点
 */
export const getVisibleTextNodes = (
  element: HTMLElement,
  options: { selectable: boolean } = { selectable: false },
) => {
  const textNodes: (Node & { hasEOL?: boolean })[] = []
  const { selectable } = options

  function traverseNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent !== '') {
      // 检查文本节点是否可见
      // const parent = node.parentNode;
      // const style = window.getComputedStyle(parent);
      // if (style && style.display !== 'none' && style.visibility !== 'hidden') {
      //   textNodes.push(node);
      // }
      textNodes.push(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(node as HTMLElement)
      const isVisible =
        style.display !== 'none' && style.visibility !== 'hidden'
      const isSelectable = isVisible && style.userSelect !== 'none' // && style.pointerEvents !== 'none'
      const flag = selectable ? isSelectable : isVisible
      if (flag) {
        if (
          !isInlineElement((node as HTMLElement).tagName || '') &&
          textNodes[textNodes.length - 1]
        ) {
          textNodes[textNodes.length - 1].hasEOL = true
        }
        node.childNodes.forEach((child) => traverseNodes(child))
      }
    }
  }
  traverseNodes(element)

  return textNodes
}

export const isNodeVisible = (node: Node) => {
  return (
    (!node.style || node.style.display != 'none') &&
    !node.hasAttribute('hidden') &&
    //check for "fallback-image" so that wikimedia math images are displayed
    (!node.hasAttribute('aria-hidden') ||
      node.getAttribute('aria-hidden') != 'true')
  )
}

export const formattedTextContent = (node: Node & { hasEOL?: boolean }) => {
  const textContent = node.textContent?.replace(/\s+/g, ' ') || ''
  if (node.hasEOL) {
    return `${textContent}\n`
  }
  return textContent
}

/**
 * 获取节点下的所有文本字符串
 * 格式化处理，类似innerText处理多余的空格换行符
 * @param nodes
 */
export const getFormattedTextFromNodes = (nodes: Node[]) => {
  let textContent = ''

  nodes.forEach((node, index) => {
    // const parent = node.parentNode;
    // const nextNode = nodes[index + 1]
    // const nextParent = nextNode ? nextNode.parentNode : null;

    // 文本节点连续换行和空格都转为单个空格
    textContent += formattedTextContent(node)

    // 判断是否需要换行
    // if (nextNode) {
    //   const parentTagName = getClosestBlockElement(parent);
    //   const nextParentTagName = getClosestBlockElement(nextParent);
    //
    //   // 如果父元素是块级元素，并且下一个文本节点的父元素不同，则换行
    //   if (parent !== nextParent && parentTagName !== nextParentTagName) {
    //     textContent += '\n';
    //   } else if (isBlockElement(parentTagName) && isBlockElement(nextParentTagName)) {
    //     // 如果当前和下一个文本节点的父元素都是块级元素，则换行
    //     textContent += '\n';
    //   } else if (parentTagName === 'br') {
    //     // 如果父元素是 <br> 标签，则换行
    //     textContent += '\n';
    //   }
    // }
  })

  return textContent
}

/**
 * 判断是否是内联标签
 * @param tagName
 */
export const isInlineElement = (tagName: string) => {
  return inlineTagNames.has(tagName.toLowerCase())
}

/**
 * 获取Readability.parse解析后的对象
 * 移除对content的序列化
 * @param replaceBody
 * @param options
 */
export const getReadabilityArticle = (
  replaceBody?: HTMLElement,
  options?: any,
) => {
  const clonedDocument = document.cloneNode(true) as Document
  if (clonedDocument && replaceBody) {
    clonedDocument.body.innerHTML = replaceBody.innerHTML
  }
  const reader = new Readability(clonedDocument as any, {
    serializer: (el) => el,
    ...options,
  })
  const readabilityArticle = reader.parse()
  const contentElement =
    readabilityArticle?.content as any as HTMLElement | null

  return { ...readabilityArticle, content: contentElement }
}

/**
 * 获取可读网页内容
 * 这里是通过readability.js库去读取网页内容
 * @param replaceBody
 * @param options
 */
export const getReadabilityPageContent = (
  replaceBody?: HTMLElement,
  options?: any,
) => {
  const readabilityArticle = getReadabilityArticle(replaceBody, options)

  if (readabilityArticle?.content) {
    // 去掉每行前后的空格
    // 将两个或更多连续的换行符替换为单个换行符
    // 将两个或更多连续的空白字符（包括空格和制表符）替换为单个空格
    // const innerText = contentElement.innerText
    //   .replace(/^\s+|\s+$/gm, '')
    //   .replace(/\n{2,}/g, '\n')
    //   .replace(/[ \t]{2,}/g, ' ')

    return `${readabilityArticle.title}\n\n${getFormattedTextFromNodes(
      getVisibleTextNodes(readabilityArticle.content),
    )}`
  }

  return ''
}

/**
 * 获取可见的网页内容
 * 这里是手动从document.body里解析可见的文本
 * @param element
 */
export const getVisibilityPageContent = (element = document.body) => {
  const textNodes = getVisibleTextNodes(element)
  const allTextContent = getFormattedTextFromNodes(textNodes)
  return allTextContent || document.body.innerText
}

/**
 * 获取iframe网页内容
 */
export const getIframePageContent = async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<string>(async (resolve) => {
    const port = new ContentScriptConnectionV2()
    const taskId = uuidV4()
    const result = await port.postMessage({
      event: 'Client_getIframePageContent',
      data: {
        taskId,
      },
    })
    if (!result.success) {
      resolve('')
    }
    const timer = setTimeout(() => {
      resolve('')
      Browser.runtime.onMessage.removeListener(listener)
    }, 10000)
    const listener = (msg: any) => {
      if (
        msg.id === MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID &&
        msg.event ===
          ('Client_ListenGetIframePageContentResponse' as IChromeExtensionClientListenEvent) &&
        msg.data.taskId === taskId
      ) {
        resolve(msg.data.pageContent)
        Browser.runtime.onMessage.removeListener(listener)
        clearTimeout(timer)
      }
    }
    Browser.runtime.onMessage.addListener(listener)
  })
}

/**
 * 获取google doc网页内容
 */
export const getGoogleDocPageContent = async () => {
  return new Promise<string>((resolve) => {
    const eventId = uuidV4()
    const timer = setTimeout(() => {
      resolve('')
      window.removeEventListener(`${eventId}-res`, listener)
    }, 10000)
    const listener = (event: any) => {
      resolve(event.detail)
      clearTimeout(timer)
    }
    window.addEventListener(`${eventId}-res`, listener, { once: true })
    window.dispatchEvent(
      new CustomEvent('MAXAI_LOAD_GOOGLE_DOC_CONTENT', {
        detail: {
          id: eventId,
        },
      }),
    )
  })
}

/**
 * 获取cnbc网页内容
 */
export const getCnbcPageContent = async () => {
  const mainContainer = document.querySelector(
    '#MainContentContainer',
  ) as HTMLDivElement
  if (mainContainer) {
    return getReadabilityPageContent(mainContainer)
  }
  return ''
}

/**
 * 获取github网页内容
 */
export const getGithubPageContent = async () => {
  const githubPageUrl = new URL(location.href)
  const githubPagePathName = githubPageUrl.pathname
  const repoAuthor = githubPagePathName.split('/')[1]
  const repoName = githubPagePathName.split('/')[2]
  // 判断是不是代码页面
  if (document.querySelector('#copilot-button-positioner')) {
    // ## File Information
    //   - Repository Name: [Repository Name](Repository Link)
    //   - File Name: File Name
    //   - File Path: File Path
    //   - File Source link: File Source link
    // ## File Content
    //   ```
    //   ```
    const fileName = githubPagePathName.split('/').pop()
    let pageContent = ``
    pageContent += `## File Information\n`
    pageContent += `- Repository Name: [${repoName}](${githubPageUrl.origin}/${repoAuthor}/${repoName})\n`
    pageContent += `- File Name: ${fileName}\n`
    pageContent += `- File Path: ${githubPagePathName}\n`
    pageContent += `- File Source link: ${githubPageUrl.href}\n`
    pageContent += `## File Content\n`
    let code = 'N/A'
    const rawLink = document.querySelector(
      'a[data-testid="raw-button"]',
    ) as HTMLAnchorElement
    if (rawLink) {
      const response = await clientFetchAPI(rawLink.href, {
        method: 'GET',
        parse: 'text',
      })
      if (response.success) {
        code = response.data
      }
    }
    pageContent += `\`\`\`\n${code}\n\`\`\`\n`
    return pageContent
  } else if (/issues\/\d+/.test(githubPagePathName)) {
    // 判断是不是issue页面
    // ## GitHub issue title
    //   - Repository Name: [Repository Name](Repository Link)
    //   - Repository issue link: [Repository Name](Repository Link)
    // ### Comments
    // #### Comment 1
    //   Author: [@username](link-to-user-profile)
    //   Date: [timestamp]
    //   Comment content.
    //   Metadata: Commenters/Collaborator/Author
    // #### Comment 2
    //   Author: [@username](link-to-user-profile)
    //   Date: [timestamp]
    //   Metadata: Commenters/Collaborator/Author
    //   Comment content.
    // ...
    const parseGithubIssueItem = (githubIssueComment: HTMLDivElement) => {
      if (!githubIssueComment) {
        return {
          author: '',
          date: '',
          content: '',
          metadata: '',
        }
      }
      const author = githubIssueComment.querySelector(
        'a.author',
      ) as HTMLAnchorElement
      const date = githubIssueComment.querySelector(
        'relative-time',
      ) as HTMLTimeElement
      const content =
        (githubIssueComment.querySelector(
          '.user-select-contain',
        ) as HTMLDivElement) ||
        (githubIssueComment.querySelector('table') as HTMLTableElement)
      const metadata = githubIssueComment.querySelector(
        '.timeline-comment-header div > span > span',
      ) as HTMLSpanElement
      return {
        author: author?.innerText || '',
        date: date?.getAttribute('datetime') || date?.title || '',
        content:
          content?.innerText
            .replace(/\n\s+/g, '\n')
            .replace(/\n{2,}/g, '\n\n')
            .trim() || 'N/A',
        metadata: metadata?.innerText || 'Commenters',
      }
    }
    const issueTitle = document.querySelector(
      '.js-issue-title',
    ) as HTMLAnchorElement
    const FirstComment = document.querySelector(
      '.js-discussion > div',
    ) as HTMLDivElement
    if (FirstComment) {
      const comments = [parseGithubIssueItem(FirstComment)]
      const otherCommentsUrl = new URL(window.location.href)
      otherCommentsUrl.pathname =
        otherCommentsUrl.pathname + `/partials/load_more`
      const result = await clientFetchAPI(otherCommentsUrl.href, {
        method: 'GET',
        parse: 'text',
      })
      if (result.success) {
        // parse dom
        const dom = new DOMParser().parseFromString(result.data, 'text/html')
        const othorComments = dom.querySelectorAll(
          '.js-timeline-item',
        ) as NodeListOf<HTMLDivElement>
        othorComments.forEach((item) => {
          comments.push(parseGithubIssueItem(item))
        })
      }
      let pageContent = ``
      pageContent += `## ${issueTitle?.innerText}\n`
      pageContent += `- Repository Name: [${repoName}](${githubPageUrl.origin}/${repoAuthor}/${repoName})\n`
      pageContent += `- Repository issue link: ${githubPageUrl.href}\n`
      comments.forEach((item, index) => {
        pageContent += `### Comment ${index + 1}\n`
        // NOTE: 浪费tokens
        // pageContent += `- Author: [${item.author}](${githubPageUrl.origin}/${item.author})\n`
        pageContent += `- Author: ${item.author}\n`
        pageContent += `- Date: ${item.date}\n`
        pageContent += `- Metadata: ${item.metadata}\n`
        pageContent += `${item.content}\n`
      })
      return pageContent
    }
  }
  return ''
}
