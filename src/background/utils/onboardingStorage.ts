import { CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY } from '@/types'
import Browser from 'webextension-polyfill'

type OnBoardingKeyType = 'ON_BOARDING_RECORD_FIRST_MESSAGE'

type OnBoardingMapType = {
  [key in OnBoardingKeyType]?: boolean | string | number
}
const defaultOnBoardingMap: OnBoardingMapType = {
  // 记录用户第一次发送的message
  ON_BOARDING_RECORD_FIRST_MESSAGE: false,
}

/**
 * 设置Chrome扩展onBoarding数据用于: onBoarding\一次性的flag\用户指引
 * @description - Set Chrome extension onBoarding data
 * @param key
 * @param value
 */
export const setChromeExtensionOnBoardingData = async (
  key: OnBoardingKeyType,
  value: boolean | string | number,
): Promise<void> => {
  const data = await getChromeExtensionOnBoardingData()
  data[key] = value
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]: JSON.stringify(data),
  })
}

/**
 * 获取Chrome扩展onBoarding数据用于: onBoarding\一次性的flag\用户指引
 * @description - Get Chrome extension onBoarding data
 */
export const getChromeExtensionOnBoardingData =
  async (): Promise<OnBoardingMapType> => {
    const data = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY,
    )
    if (data[CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]) {
      // 因为更新的时候有可能会增加新的Key，所以需要合并
      return {
        ...defaultOnBoardingMap,
        ...JSON.parse(data[CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]),
      }
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]:
          JSON.stringify(defaultOnBoardingMap),
      })
      return defaultOnBoardingMap
    }
  }

/** 重置Chrome扩展onBoarding数据用于: onBoarding\一次性的flag\用户指引
 * @description - Reset Chrome extension onBoarding data
 */
export const resetChromeExtensionOnBoardingData = async (): Promise<void> => {
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]:
      JSON.stringify(defaultOnBoardingMap),
  })
}
