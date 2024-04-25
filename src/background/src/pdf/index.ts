import Browser from 'webextension-polyfill'

import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import Log from '@/utils/Log'
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

export const openPDFViewer = async (
  tabId: number,
  url: string,
  newTab = false,
) => {
  const file = encodeURIComponent(url)
  // 由于在 sidebar home view 中可以点击 Chat with pdf 按钮直接进入到 pdf viewer 页面，所以这里不需要判断是否开启 pdf viewer
  // 并且 file === '' 时也可以进入，因为这时候是打开一个空白的 pdf viewer ui
  if (file || file === '') {
    const redirectUrl = Browser.runtime.getURL(
      `/pages/pdf/web/viewer.html?file=${file}`,
    )
    log.info('pdfSnifferStartListener success', url, redirectUrl)
    if (newTab) {
      await Browser.tabs.create({
        url: redirectUrl,
        active: true,
      })
    } else {
      await Browser.tabs.update(tabId, {
        url: redirectUrl,
      })
    }
  }
}

export const pdfSnifferStartListener: Parameters<
  typeof Browser.tabs.onUpdated.addListener
>[0] = async (tabId, changeInfo, tab) => {
  const settings = await getChromeExtensionDBStorage()
  // 如果开启了 settings pdf viewer, 才会触发 pdf url 的监听和重定向
  if (settings.userSettings?.pdf?.enabled) {
    const fetchingMap = new Map<
      string,
      'fetching' | 'validPDF' | 'invalidPDF'
    >()
    if (tab.active) {
      const url = tab.url || tab.pendingUrl
      // 如果是本地文件,并且是.pdf，直接打开
      if (url?.startsWith('file://') || url?.startsWith('ftp://')) {
        if (url.endsWith('.pdf') || url.endsWith('.PDF')) {
          openPDFViewer(tabId, url).then().catch()
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
                  openPDFViewer(tabId, url).then().catch()
                } else {
                  fetchingMap.set(url, 'invalidPDF')
                }
              })
              .catch(function (error) {
                fetchingMap.delete(url)
              })
          } else if (fetchingMap.get(url) === 'validPDF') {
            openPDFViewer(tabId, url).then().catch()
          }
        }
      }
    }
  }
}
