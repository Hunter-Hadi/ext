import { clientRunBackgroundFunction } from '@/utils/index'

/**
 * 这个文件是客户端专门用来调用chrome extension 方法的集合，例如chrome.tabs.query()
 */

export const clientRunBackgroundGetScreenshot = async (
  url = window.location.href,
  needCompress = true,
) => {
  let activeTabs = await clientRunBackgroundFunction('tabs', 'query', [
    {
      url,
    },
  ])
  if (activeTabs?.length === 0) {
    activeTabs = await clientRunBackgroundFunction('tabs', 'query', [
      {
        active: true,
      },
    ])
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
