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
