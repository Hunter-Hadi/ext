/**
 * TODO 理论上这个文件需要拆分到common/utils里
 */
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

const isElement = (node: Node): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE

/**
 * 获取可见文本节点
 * @param element
 * @param options
 * @param options.selectable 为true代表过滤掉无法选择的节点
 */
export const getVisibleTextNodes = (
  element: HTMLElement,
  options: { selectable: boolean } = { selectable: false },
) => {
  const textNodes: (Node & { hasEOL?: boolean })[] = []
  const { selectable } = options

  function traverseNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '') {
      textNodes.push(node)
    } else if (isElement(node)) {
      if (
        ['script', 'style', 'noscript', 'header', 'footer', 'video'].includes(
          node.tagName.toLowerCase(),
        )
      ) {
        return
      }
      let style = node.style
      try {
        style = window.getComputedStyle(node)
      } catch (e) {
        // element不在dom里会报错
      }
      const isVisible = isElementVisible(node, style)
      const isSelectable = isVisible && style.userSelect !== 'none' // && style.pointerEvents !== 'none'
      const flag = selectable ? isSelectable : isVisible
      if (flag) {
        if (
          !isInlineElement(node.tagName || '') &&
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

/**
 * 判断元素是否可见
 * @param element
 * @param style
 */
export const isElementVisible = (
  element: Element,
  style?: CSSStyleDeclaration,
) => {
  if (!style) style = window.getComputedStyle(element)
  return (
    // 样式可见
    style.display !== 'none' &&
    // style.visibility !== 'hidden' &&
    // 无隐藏属性
    !element.hasAttribute('hidden') &&
    (!element.hasAttribute('aria-hidden') ||
      element.getAttribute('aria-hidden') != 'true' ||
      // check for "fallback-image" so that wikimedia math images are displayed
      (element.className &&
        element.className.includes &&
        element.className.includes('fallback-image')))
  )
}

/**
 * 格式化节点文本
 * @param node
 */
export const formattedTextContent = (node: Node & { hasEOL?: boolean }) => {
  // 文本节点连续换行和空格都转为单个空格
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

  nodes.forEach((node) => {
    if (
      textContent[textContent.length - 1] === '\n' ||
      textContent[textContent.length - 1] === ' '
    ) {
      // 当前文本处于新的一行或者之前已经有空格，处理掉开头多余的空格
      textContent += formattedTextContent(node).trimStart()
    } else {
      // 这里不处理是因为可能尾部的空格和下一个同一行的文本有关
      textContent += formattedTextContent(node)
    }
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
