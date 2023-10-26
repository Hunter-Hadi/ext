// import Log from '@/utils/Log'
import {
  createBackgroundMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
import {
  getWebpageTitleAndText,
  getWebpageUrlContent,
} from '@/features/shortcuts/utils/webHelper'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import Browser from 'webextension-polyfill'
import { backgroundSendClientToExecuteOperationElement } from '@/features/shortcuts/utils/OperationElementHelper'
import { promiseTimeout } from '@/utils/promiseUtils'

// const log = new Log('Background/ShortCut')

export const ShortcutMessageBackgroundInit = () => {
  createBackgroundMessageListener(async (runtime, event, data, sender) => {
    if (runtime === 'shortcut') {
      switch (event as IShortCutsSendEvent) {
        case 'ShortCuts_getContentOfURL': {
          const { URL, timeout } = data
          const webpageData = await promiseTimeout(
            getWebpageTitleAndText(URL),
            timeout || 60 * 1000, //如果没有传入timeout，就默认60秒
            {
              title: '',
              body: '',
              url: '',
              success: false,
            },
          )
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
            const OperationElementConfig = data.OperationElementConfig as OperationElementConfigType
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
              const delay = (t: number) =>
                new Promise((resolve) => setTimeout(resolve, t))
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
                await delay(interval)
              }
              if (isLoaded) {
                const response = await backgroundSendClientToExecuteOperationElement(
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
