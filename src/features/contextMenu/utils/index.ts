export const checkIsCanInputElement = (element: HTMLElement) => {
  let parentElement: HTMLElement | null = element
  let maxLoop = 10
  while (parentElement && maxLoop > 0) {
    if (
      parentElement.tagName === 'INPUT' ||
      parentElement.tagName === 'TEXTAREA' ||
      parentElement.getAttribute('contenteditable') === 'true'
    ) {
      return true
    }
    parentElement = parentElement.parentElement
    maxLoop--
  }
  return false
}
