export const elementCheckVisibility = (element: HTMLElement) => {
  if (element) {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      return false
    }
    return true
  }
  return false
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
