import { IShortCutsSendEvent } from '@/background/eventType'
// import Log from '@/utils/Log'
import { createBackgroundMessageListener } from '@/background/utils'
import { getWebpageTitleAndText } from '@/features/shortcuts/utils/webHelper'

// const log = new Log('Background/ShortCut')
export const ShortcutMessageInit = () => {
  createBackgroundMessageListener(async (runtime, event, data, sender) => {
    if (runtime === 'shortcut') {
      switch (event as IShortCutsSendEvent) {
        case 'ShortCuts_getContentOfURL': {
          const { URL } = data
          const webpageData = await getWebpageTitleAndText(URL)
          return {
            data: webpageData,
            success: webpageData.success,
            message: 'ok',
          }
        }
        default:
          break
      }
    }
    return undefined
  })
}
