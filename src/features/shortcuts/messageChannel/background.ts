// import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'

import {
  createBackgroundMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import { backgroundSendClientToExecuteOperationElement } from '@/features/shortcuts/utils/OperationElementHelper'
import { wait } from '@/utils'

// const log = new Log('Background/ShortCut')

export const ShortcutMessageBackgroundInit = () => {
  createBackgroundMessageListener(async (runtime, event, data, sender) => {
    if (runtime === 'shortcut') {
      switch (event as IShortCutsSendEvent) {
        case 'ShortCuts_OperationPageElement':
          {
            const OperationElementConfig =
              data.OperationElementConfig as OperationElementConfigType
            let executePageTabId =
              (data.OperationElementTabID as number) || sender.tab?.id
            let currentTab: Browser.Tabs.Tab | null = null
            if (executePageTabId) {
              currentTab = await safeGetBrowserTab(executePageTabId)
            }
            if (!currentTab?.id) {
              return {
                data: null,
                success: false,
                message: 'No tabId to execute operation page element.',
              }
            }
            executePageTabId = currentTab.id
            if (executePageTabId !== sender.tab?.id) {
              // wait page loaded
              const interval = 500
              const maxCount = (10 * 1000) / interval
              let isLoaded = false
              let count = 0
              while (!isLoaded && count < maxCount) {
                const currentTab = await safeGetBrowserTab(executePageTabId)
                if (!currentTab) {
                  break
                }
                console.log('轮训tab', currentTab.status)
                if (currentTab.status === 'complete') {
                  isLoaded = true
                }
                count++
                await wait(interval)
              }
              if (isLoaded) {
                const response =
                  await backgroundSendClientToExecuteOperationElement(
                    executePageTabId,
                    OperationElementConfig,
                  )
                return {
                  data: response,
                  success: response.success,
                  message: 'ok',
                }
              }
            }
            return {
              data: null,
              success: false,
              message: 'Page not loaded.',
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
