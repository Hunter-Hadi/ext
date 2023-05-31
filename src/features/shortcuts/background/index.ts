// import Log from '@/utils/Log'
import { createBackgroundMessageListener } from '@/background/utils'
import {
  getWebpageTitleAndText,
  getWebpageUrlContent,
} from '@/features/shortcuts/utils/webHelper'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'

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
        case 'ShortCuts_getContentOfSearchEngine': {
          const { URL } = data
          const webpageContent = await getWebpageUrlContent(URL)
          return {
            data: webpageContent,
            success: webpageContent.success,
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
