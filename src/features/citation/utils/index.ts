import { ICitationNode } from '@/features/citation/types'

export const createCitationNode = (
  parent: ICitationNode | null = null,
): ICitationNode => {
  if (parent) {
    const node = {
      parent,
      children: [],
      index: parent.children.length,
    }
    parent.children.push(node)
    return node
  }
  return {
    parent,
    children: [],
    index: 0,
  }
}

export const isScrollableElement = (element: Element) => {
  const styles = window.getComputedStyle(element)
  const overflowY = styles.overflowY
  const overflowX = styles.overflowX
  return (
    overflowY === 'auto' ||
    overflowY === 'scroll' ||
    overflowX === 'auto' ||
    overflowX === 'scroll'
  )
}

export const scrollToRange = (range: Range) => {
  const textNode = range.startContainer
  const rangeRect = range.getBoundingClientRect()

  let node: Node | null = textNode
  while (node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      isScrollableElement(node as HTMLElement)
    ) {
      scrollToElement(node as HTMLElement, rangeRect, 'smooth')
    }
    node = node.parentNode
  }
  if (document.body.clientHeight > window.innerHeight) {
    scrollToElement(document.body, rangeRect, 'smooth')
  }
}

export const scrollToElement = (
  container: Element,
  element: Element | DOMRect,
  behavior?: ScrollBehavior,
) => {
  const containerRect = container.getBoundingClientRect()
  const elementRect =
    element instanceof Element ? element.getBoundingClientRect() : element
  // 计算目标元素相对于容器的位置
  const elementOffsetTop =
    elementRect.top - containerRect.top + container.scrollTop
  const containerHeight =
    container === document.body ? window.innerHeight : containerRect.height
  let scrollTop = elementOffsetTop
  // 判断元素高度是否小于可视区域高度
  if (elementRect.height < containerHeight) {
    // 计算滚动位置，使元素位于正中间
    scrollTop = elementOffsetTop - containerHeight / 2 + elementRect.height / 2
  } else {
    // 元素高度大于容器高度，滚动到元素顶部
    scrollTop = elementOffsetTop
  }

  if (container === document.body) {
    window.scrollTo({ top: scrollTop, behavior })
  }

  container.scrollTo({
    top: scrollTop,
    behavior,
  })
}
