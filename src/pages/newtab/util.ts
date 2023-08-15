import Browser from 'webextension-polyfill'

export const isMaxAINewTabPage = () => {
  return (
    typeof window !== undefined &&
    Browser.runtime.getURL('/pages/newtab/index.html') === window.location.href
  )
}
