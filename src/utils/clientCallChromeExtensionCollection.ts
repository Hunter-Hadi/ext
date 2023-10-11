import { clientRunBackgroundFunction } from '@/utils/index'
import {
  base642file,
  file2base64,
} from '@/background/utils/uplpadFileProcessHelper'
import imageCompression from 'browser-image-compression'

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
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (needCompress && screenshot) {
      let start = new Date().getTime()
      const file = base642file(screenshot, 'screenshot.png')
      if (file) {
        start = new Date().getTime()
        const compressedFile = await imageCompression(file, {
          useWebWorker: true,
          maxWidthOrHeight: 1920,
        })
        const compressedFileBase64 = file2base64(compressedFile)
        // using seconds
        console.log(
          'clientRunBackgroundGetScreenshot compress time',
          (new Date().getTime() - start) / 1000,
          '\n',
          `originalFile size ${file.size / 1024 / 1024} MB`,
          '\n',
          `compressedFile size ${compressedFile.size / 1024 / 1024} MB`,
          '\n',
          `compress rate ${compressedFile.size / file.size}`,
        )
        return compressedFileBase64 || screenshot
      }
    }
    return screenshot
  }
  return null
}
