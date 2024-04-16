/**
 * 延迟并滚动到输入助手按钮
 * @param t
 * @param inputAssistantButton
 */
export const delayAndScrollToInputAssistantButton = (
  t: number,
  inputAssistantButton?: HTMLElement,
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
