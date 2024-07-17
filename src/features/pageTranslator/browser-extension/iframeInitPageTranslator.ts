import Browser from 'webextension-polyfill'

import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import PageTranslator from '@/features/pageTranslator/core'

const iframeInitPageTranslator = () => {
  console.log(`PageTranslator initIframeListener`)
  if (window.self !== window.top) {
    getChromeExtensionDBStorage().then((result) => {
      if (result.userSettings?.pageTranslation?.sourceLanguage) {
        PageTranslator.updateFromCode(
          result.userSettings.pageTranslation.sourceLanguage,
        )
      }
      if (result.userSettings?.pageTranslation?.targetLanguage) {
        PageTranslator.updateToCode(
          result.userSettings.pageTranslation.targetLanguage,
        )
      }
    })
    Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.eventType === 'MAXAI_PageTranslatorEvent_doTranslate') {
        const { fn, args } = message as any
        if (fn && (PageTranslator as any)[fn]) {
          console.log(`PageTranslator message`, window.location.href, fn, args)
          ;(PageTranslator as any)[fn](...args)
        }
        sendResponse()
      }
      return true
    })
  }
}
export default iframeInitPageTranslator
