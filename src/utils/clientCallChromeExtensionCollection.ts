import { Tabs } from 'webextension-polyfill'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { clientRunBackgroundFunction } from '@/utils/index'

/**
 * 这个文件是客户端专门用来调用chrome extension 方法的集合，例如chrome.tabs.query()
 */

export const clientRunBackgroundGetScreenshot = async (needCompress = true) => {
  let activeTabs: Tabs.Tab[] = []
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  const currentTabData = await port.postMessage({
    event: 'Client_ping',
  })
  if (
    currentTabData.success &&
    currentTabData?.data?.tabId &&
    currentTabData?.data?.windowId
  ) {
    activeTabs = [
      {
        windowId: currentTabData.data.windowId,
        id: currentTabData.data.tabId,
      } as Tabs.Tab,
    ]
  }
  if (activeTabs.length === 0) {
    activeTabs =
      (await clientRunBackgroundFunction('tabs', 'query', [
        {
          active: true,
        },
      ])) || []
  }
  const windowId = activeTabs?.[0]?.windowId
  const screenshotTabId = activeTabs?.[0]?.id
  if (windowId && screenshotTabId) {
    // focus tab
    await clientRunBackgroundFunction('tabs', 'update', [
      screenshotTabId,
      {
        active: true,
      },
    ] as any)
    const screenshot = await clientRunBackgroundFunction(
      'tabs',
      'captureVisibleTab',
      [
        windowId,
        {
          format: 'png',
          quality: 80,
        },
      ],
    )
    // TODO: compress screenshot
    return screenshot
  }
  return null
}
