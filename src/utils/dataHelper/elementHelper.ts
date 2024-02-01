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
