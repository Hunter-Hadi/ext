import Browser from 'webextension-polyfill'
import Log from '@/utils/Log'
import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
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
  const fetchingMap = new Map<string, 'fetching' | 'validPDF' | 'invalidPDF'>()
  const openPDFViewer = async (tabId: number, url: string) => {
    const settings = await getLiteChromeExtensionDBStorage()
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
  Browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
      const url = tab.url || tab.pendingUrl
      // 如果是本地文件,并且是.pdf，直接打开
      if (url?.startsWith('file://') || url?.startsWith('ftp://')) {
        if (url.endsWith('.pdf') || url.endsWith('.PDF')) {
          await openPDFViewer(tabId, url)
        }
      }
      // 如果是网络文件，检测是否是pdf
      if (url?.endsWith('.pdf') || url?.endsWith('.PDF')) {
        if (url?.startsWith('http://') || url?.startsWith('https://')) {
          if (!fetchingMap.has(url)) {
            fetchingMap.set(url, 'fetching')
            // 获取文件类型
            fetch(url, { method: 'HEAD' })
              .then(function (response) {
                const contentType = response.headers.get('content-type')
                if (contentType === 'application/pdf') {
                  fetchingMap.set(url, 'validPDF')
                  openPDFViewer(tabId, url)
                } else {
                  fetchingMap.set(url, 'invalidPDF')
                }
              })
              .catch(function (error) {
                fetchingMap.delete(url)
              })
          } else if (fetchingMap.get(url) === 'validPDF') {
            await openPDFViewer(tabId, url)
          }
        }
      }
    }
  })
}
