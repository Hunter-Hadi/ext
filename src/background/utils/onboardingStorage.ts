import {
  AI_PROVIDER_MAP,
  CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY,
} from '@/constants'
import Browser from 'webextension-polyfill'
import { IAIProviderType } from '@/background/provider/chat'

export type OnBoardingKeyType =
  | 'ON_BOARDING_RECORD_FIRST_MESSAGE'
  | 'ON_BOARDING_RECORD_BROWSER_VERSION'
  | `ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_${IAIProviderType}`

export type OnBoardingMapType = {
  [key in OnBoardingKeyType]?: boolean | string | number
}
const getDefaultOnBoardingMap = (): OnBoardingMapType => {
  const onBoardingMap: OnBoardingMapType = {
    // 记录用户第一次发送的message
    ON_BOARDING_RECORD_FIRST_MESSAGE: false,
    // 记录用户浏览器版本号太旧
    ON_BOARDING_RECORD_BROWSER_VERSION: false,
  }
  // 记录每个AI Provider至少auth过一次
  Object.keys(AI_PROVIDER_MAP).forEach((AI_PROVIDER) => {
    onBoardingMap[
      `ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_${AI_PROVIDER}` as OnBoardingKeyType
    ] = false
  })
  return onBoardingMap
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
        ...getDefaultOnBoardingMap(),
        ...JSON.parse(data[CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]),
      }
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]: JSON.stringify(
          getDefaultOnBoardingMap(),
        ),
      })
      return getDefaultOnBoardingMap()
    }
  }

/** 重置Chrome扩展onBoarding数据用于: onBoarding\一次性的flag\用户指引
 * @description - Reset Chrome extension onBoarding data
 */
export const resetChromeExtensionOnBoardingData = async (): Promise<void> => {
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]: JSON.stringify(
      getDefaultOnBoardingMap(),
    ),
  })
}
