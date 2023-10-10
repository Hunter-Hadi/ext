import Browser from 'webextension-polyfill'

export const isMaxAINewTabPage = () => {
  try {
    return (
      typeof window !== undefined &&
      Browser.runtime.getURL('/pages/chat/index.html') === window.location.href
    )
  } catch (e) {
    return false
  }
}
