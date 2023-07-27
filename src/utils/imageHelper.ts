import Browser from 'webextension-polyfill'

export const getChromeExtensionAssetsURL = (path: string): string => {
  return Browser.runtime.getURL(`/assets/USE_CHAT_GPT_AI${path}`)
}
