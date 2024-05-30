// 根据 style 判断 element 是否可见
export const elementCheckVisibility = (element: HTMLElement) => {
  if (!element) return false

  const react = element.getBoundingClientRect()
  if (react.width === 0 && react.height === 0) {
    return false
  }

  // 检查元素本身的 display, visibility 和 opacity 属性
  const style = window.getComputedStyle(element)
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false
  }

  // 检查祖先元素的可见性，尽可能减少递归深度
  let parent = element.parentElement
  while (parent) {
    const parentStyle = window.getComputedStyle(parent)
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parentStyle.opacity === '0'
    ) {
      return false
    }
    parent = parent.parentElement
  }

  return true
}

// 检查元素是否在视口中
export const elementCheckInViewport = (element: HTMLElement) => {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0
  const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0

  return vertInView && horInView
}

// 综合检查元素是否可见
export const elementCheckFullyVisible = (element: HTMLElement) => {
  // TODO: refine 当元素被遮挡时，也会返回 true，需要优化
  return elementCheckVisibility(element) && elementCheckInViewport(element)
}

export const isSupportWebComponent = () => {
  if (window.location.host === 'dribbble.com') {
    // 在 dribbble.com 中会把自定义元素 隐藏，所以不使用自定义元素
    return false
  }

  return 'customElements' in window
}

/**
 * 延迟并滚动到输入助手按钮
 * @param t
 * @param inputAssistantButton
 */
export const delayAndScrollToInputAssistantButton = (
  t: number,
  inputAssistantButton?: HTMLElement | null,
) =>
  new Promise((resolve) =>
    setTimeout(() => {
      if (inputAssistantButton) {
        const screen = window.innerHeight
        const toScroll = screen / 10
        inputAssistantButton.scrollIntoView(false)
        window.scrollBy(0, toScroll)
      }
      // scroll into view
      resolve(true)
    }, t),
  )

/**
 * 寻找父级元素包含的selector元素
 * @param selector
 * @param startElement
 * @param maxDeep
 */
export const findSelectorParent = (
  selector: string,
  startElement: HTMLElement | null,
  maxDeep = 20,
) => {
  let parent = startElement
  let deep = 0
  while (deep < maxDeep && !parent?.querySelector(selector)) {
    parent = parent?.parentElement as HTMLElement
    deep++
  }
  return (parent?.querySelector(selector) as HTMLElement) || null
}
/**
 * 严格寻找父级元素包含的selector元素
 * @param selector
 * @param startElement
 * @param maxDeep
 */
export const findSelectorParentStrict = (
  selector: string,
  startElement: HTMLElement,
  maxDeep = 20,
) => {
  let parent: HTMLElement = startElement
  let deep = 0
  while (
    parent?.querySelector(selector)?.isSameNode(startElement) ||
    (deep < maxDeep && !parent?.querySelector(selector))
  ) {
    parent = parent?.parentElement as HTMLElement
    deep++
  }
  return (parent?.querySelector(selector) as HTMLElement) || null
}

/**
 * 寻找父级元素是selector元素
 * @param selector
 * @param startElement
 * @param maxDeep
 */
export const findParentEqualSelector = (
  selector: string,
  startElement: HTMLElement,
  maxDeep = 20,
) => {
  try {
    let parent: HTMLElement = startElement
    let deep = 0
    while (deep < maxDeep && !parent?.matches(selector)) {
      parent = parent?.parentElement as HTMLElement
      deep++
    }
    return parent?.matches(selector) ? parent : null
  } catch (e) {
    return null
  }
}

/**
 * 判断一个元素是否在 shadowRoot 中
 *
 * @param {Element} element - 要检查的元素
 * @returns {Document} - 如果元素在 shadowRoot 中，返回这个 shadowRoot， 否则返回 null
 */
export const isElementInShadowRoot = (element: HTMLElement) => {
  let parent = element.parentNode
  while (parent) {
    if (parent.toString() === '[object ShadowRoot]') {
      return parent as Document
    }
    parent = parent.parentNode
  }
  return null
}
