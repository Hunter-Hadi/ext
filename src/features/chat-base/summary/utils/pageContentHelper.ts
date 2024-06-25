import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import {
  getIframePageContent,
  isNeedGetIframePageContent,
} from '@/pages/content_script_iframe/iframePageContentHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const getIframeOrSpecialHostPageContent = async (): Promise<string> => {
  let pageContent = ''
  // 判断是不是需要从iframe获取网页内容: Microsoft word
  if (isNeedGetIframePageContent()) {
    pageContent = await getIframePageContent()
  } else if (isNeedGetSpecialHostPageContent()) {
    // 判断是不是需要从特殊网站获取网页内容： google docs
    pageContent = await getSpecialHostPageContent()
  }
  pageContent = pageContent.trim()
  return pageContent
}

const isNeedGetSpecialHostPageContent = () => {
  const host = getCurrentDomainHost()
  return [
    'docs.google.com',
    'cnbc.com',
    'github.com',
    'timesofindia.indiatimes.com',
  ].find((item) => item === host)
}

const getSpecialHostPageContent = async () => {
  const host = getCurrentDomainHost()
  if (host === 'docs.google.com') {
    return new Promise<string>((resolve) => {
      const eventId = uuidV4()
      const script = document.createElement('script')
      script.type = 'module'
      script.src = Browser.runtime.getURL('pages/googleDoc/index.js')
      script.setAttribute('data-event-id', eventId)
      script.id = 'MAXAI_GOOGLE_DOC_CONTENT_SCRIPT'
      document.body.appendChild(script)
      let isResolved = false
      window.addEventListener(
        `${eventId}res`,
        (e) => {
          if (isResolved) {
            return
          }
          isResolved = true
          resolve((e as any).detail)
        },
        { once: true },
      )
      // 10s后如果没有获取到内容，就直接返回
      setTimeout(() => {
        if (isResolved) {
          return
        }
        isResolved = true
        resolve('')
      }, 10000)
    })
  } else if (host === 'cnbc.com') {
    const mainContainer = document.querySelector(
      '#MainContentContainer',
    ) as HTMLDivElement
    if (mainContainer) {
      return getPageContentWithMozillaReadability(mainContainer)
    }
    return ''
  } else if (host === 'github.com') {
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
  } else if (host === 'timesofindia.indiatimes.com') {
    const contentContainer = document.querySelector(
      '#app .nonAppView > .contentwrapper',
    ) as HTMLDivElement
    if (contentContainer) {
      return contentContainer.innerText
      // return getPageContentWithMozillaReadability(contentContainer)
    }
  }
  return ''
}
