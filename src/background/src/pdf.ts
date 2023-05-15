import Browser from 'webextension-polyfill'

const declarativeNetRequestRuleIds = [1, 2]
export const pdfSnifferStartListener = async () => {
  const result = await Browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: declarativeNetRequestRuleIds,
    addRules: [
      {
        id: declarativeNetRequestRuleIds[0],
        priority: 1,
        condition: {
          regexFilter: `^((file|ftp):\\/\\/.*\\.pdf)`,
          resourceTypes: ['main_frame', 'sub_frame'],
        },
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution: `chrome-extension://${Browser.runtime.id}/pages/pdf/web/viewer.html?file=\\0`,
          },
        },
      },
    ],
  })
  const rules = await Browser.declarativeNetRequest.getDynamicRules()
  console.log('pdfSnifferStartListener success', result, rules)
}
