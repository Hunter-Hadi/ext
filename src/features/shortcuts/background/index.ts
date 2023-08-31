// import Log from '@/utils/Log'
import { createBackgroundMessageListener } from '@/background/utils'
import {
  getWebpageTitleAndText,
  getWebpageUrlContent,
} from '@/features/shortcuts/utils/webHelper'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChromeExtensionSendEvent } from '@/background/eventType'

// const log = new Log('Background/ShortCut')

const backgroundExecuteOperationElement = (
  tabId: number,
  OperationElementConfig: OperationElementConfigType,
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const taskId = uuidV4()
    const onceListener = (event: any, data: any, sender: any) => {
      debugger
    }
    Browser.runtime.onMessage.addListener(onceListener)
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event:
        'ShortCuts_ClientExecuteOperationPageElement' as IChromeExtensionSendEvent,
      data: {
        taskId,
        OperationElementConfig,
      },
    })
  })
}

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
        case 'ShortCuts_OperationPageElement':
          {
            const OperationElementConfig =
              data.OperationElementConfig as OperationElementConfigType
            let executePageTabId =
              OperationElementConfig.executePageTabId || sender.tab?.id
            let currentTab: Browser.Tabs.Tab | null = null
            if (executePageTabId) {
              currentTab = await Browser.tabs.get(executePageTabId)
            }
            if (!currentTab?.id) {
              return {
                data: false,
                success: false,
                message: 'No tabId to execute operation page element.',
              }
            }
            executePageTabId = currentTab.id
            const success = await backgroundExecuteOperationElement(
              executePageTabId,
              OperationElementConfig,
            )
            return {
              data: success,
              success,
              message: 'ok',
            }
          }
          break
        default:
          break
      }
    }
    return undefined
  })
}
