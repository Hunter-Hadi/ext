import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { createClientMessageListener } from '@/background/utils'
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
    createClientMessageListener(async (event, data) => {
      switch (event as IChromeExtensionClientListenEvent) {
        case 'Client_listenPageTranslationEvent': {
          const { fn, args } = data
          if (fn && (PageTranslator as any)[fn]) {
            console.log(
              `PageTranslator message`,
              window.location.href,
              fn,
              args,
            )
            ;(PageTranslator as any)[fn](...args)
          }
          return {
            success: true,
            data: true,
            message: 'ok',
          }
        }
        default:
          break
      }
      return undefined
    })
  }
}
export default iframeInitPageTranslator
