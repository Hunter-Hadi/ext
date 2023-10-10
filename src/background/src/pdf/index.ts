import Browser from 'webextension-polyfill'
import Log from '@/utils/Log'
import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
// NOTE: 2023-05-15
/**
 * NOTE: 2023-05-15
 * @description: 用这个方式支持本地插件需要新的权限，所以先用检测url的方式
 * 1. permissions: ["declarativeNetRequest", "declarativeNetRequestFeedback"]
 */
// const declarativeNetRequestRuleIds = [1, 2]
// export const pdfSnifferStartListener = async () => {
//   const result = await Browser.declarativeNetRequest.updateDynamicRules({
//     removeRuleIds: declarativeNetRequestRuleIds,
//     addRules: [
//       {
//         id: declarativeNetRequestRuleIds[0],
//         priority: 1,
//         condition: {
//           regexFilter: `^((file|ftp):\\/\\/.*\\.pdf)`,
//           resourceTypes: ['main_frame', 'sub_frame'],
//         },
//         action: {
//           type: 'redirect',
//           redirect: {
//             regexSubstitution: `chrome-extension://${Browser.runtime.id}/pages/pdf/web/viewer.html?file=\\0`,
//           },
//         },
//       },
//     ],
//   })
//   const rules = await Browser.declarativeNetRequest.getDynamicRules()
//   console.log('pdfSnifferStartListener success', result, rules)
// }
const log = new Log('PDF')
export const pdfSnifferStartListener = async () => {
  Browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
      const url = tab.url || tab.pendingUrl
      if (url?.startsWith('file://') || url?.startsWith('ftp://')) {
        if (url.endsWith('.pdf') || url.endsWith('.PDF')) {
          const settings = await getChromeExtensionDBStorage()
          if (settings.userSettings?.pdf?.enabled) {
            const redirectUrl = Browser.runtime.getURL(
              `/pages/pdf/web/viewer.html?file=${encodeURIComponent(url)}`,
            )
            log.info('pdfSnifferStartListener success', url, redirectUrl)
            await Browser.tabs.update(tabId, {
              url: redirectUrl,
            })
          }
        }
      }
    }
  })
}
