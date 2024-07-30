import Browser from 'webextension-polyfill'

import {
  APP_VERSION,
  CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY,
} from '@/constants'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import {
  InputAssistantButtonGroupConfigHostKeys,
  WritingAssistantButtonGroupConfigHostType,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import { IOnBoardingTooltipOpenedCacheKey } from '@/features/onboarding/types'
import { ISurveyOpenedOnBoardingStorageKey } from '@/features/survey/types'

export type OnBoardingKeyType =
  | 'ON_BOARDING_RECORD_FIRST_MESSAGE'
  | 'ON_BOARDING_RECORD_BROWSER_VERSION'
  // 2023年的黑色星期五的banner
  | 'ON_BOARDING_BLACK_FRIDAY_2023_BANNER'
  | 'ON_BOARDING_BLACK_FRIDAY_2023_OPEN_LINK'
  // 2023圣诞节
  | 'ON_BOARDING_CHRISTMAS_2023_BANNER'
  | 'ON_BOARDING_CHRISTMAS_2023_OPEN_LINK'
  // 2024插件1周年
  | 'ON_BOARDING_1ST_ANNIVERSARY_2024_BANNER'
  | 'ON_BOARDING_1ST_ANNIVERSARY_2024_OPEN_LINK'
  | 'ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG'
  | `ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_${typeof APP_VERSION}`
  // summary / search / instant reply / input assistant button free trial times
  | 'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_TIMES'
  | `ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_${IPageSummaryType}_TIMES`
  | 'ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES'
  | 'ON_BOARDING_RECORD_INSTANT_REPLY_FREE_TRIAL_TIMES'
  | `ON_BOARDING_RECORD_INPUT_ASSISTANT_BUTTON_${WritingAssistantButtonGroupConfigHostType}_TIMES`
  // MaxAI 3.0版本OnBoarding
  | 'ON_BOARDING_MAXAI_3_0'
  // MaxAI 3.2.1版本
  | 'ON_BOARDING_EXTENSION_VERSION_3_2_1_UPDATE_OPEN_LINK'
  // MaxAI 4.1.0版本
  | 'ON_BOARDING_EXTENSION_VERSION_4_1_0_UPDATE_OPEN_LINK'
  // MaxAI 4.3.8版本更新弹窗
  | 'ON_BOARDING_EXTENSION_VERSION_4_3_8_UPDATE_MODAL'
  // MaxAI 4.6.1版本更新弹窗
  | 'ON_BOARDING_EXTENSION_VERSION_4_6_1_UPDATE_MODAL'
  // MaxAI 4.8.0版本更新弹窗
  | 'ON_BOARDING_EXTENSION_VERSION_4_8_0_UPDATE_MODAL'
  // MaxAI 4.8.2版本更新弹窗
  | 'ON_BOARDING_EXTENSION_VERSION_4_8_2_UPDATE_MODAL'
  // on boarding tooltip cache key
  | IOnBoardingTooltipOpenedCacheKey
  //  survey dialog 是否弹窗过的标记
  | ISurveyOpenedOnBoardingStorageKey

export type OnBoardingMapType = {
  [key in OnBoardingKeyType]?: boolean | string | number
}
const getDefaultOnBoardingMap = (): OnBoardingMapType => {
  const onBoardingMap: OnBoardingMapType = {
    // 记录用户第一次发送的message
    ON_BOARDING_RECORD_FIRST_MESSAGE: false,
    // 记录用户浏览器版本号太旧
    ON_BOARDING_RECORD_BROWSER_VERSION: false,
    ON_BOARDING_BLACK_FRIDAY_2023_BANNER: false,
    ON_BOARDING_BLACK_FRIDAY_2023_OPEN_LINK: false,
    ON_BOARDING_CHRISTMAS_2023_OPEN_LINK: false,
    ON_BOARDING_CHRISTMAS_2023_BANNER: false,
    ON_BOARDING_1ST_ANNIVERSARY_2024_BANNER: false,
    ON_BOARDING_1ST_ANNIVERSARY_2024_OPEN_LINK: false,
    ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG: false,
    ON_BOARDING_EXTENSION_VERSION_3_2_1_UPDATE_OPEN_LINK: false,
    ON_BOARDING_EXTENSION_VERSION_4_1_0_UPDATE_OPEN_LINK: false,
    // 记录用户剩余的summary free trial times - 2次 - 2023-10-12 - @tdzhang
    // 关闭free trail - 2023-10-17 - @HuangSong
    // 根据后端返回的role是否为free_trail判断是否开启，5次 - 2024-07-03 - @HuangSong
    // free_trail对PDF/Youtube/其他类型各有5次免费使用机会 - 2024-07-04 - @HuangSong
    ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_TIMES: 5,
    // 根据后端返回的role是否为free_trail判断是否开启，5次 - 2024-07-04 - @HuangSong
    ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_PAGE_SUMMARY_TIMES: 5,
    ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_PDF_CRX_SUMMARY_TIMES: 5,
    ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_YOUTUBE_VIDEO_SUMMARY_TIMES: 5,
    // 记录用户剩余的search free trial times - 2次 - 2023-10-12 - @tdzhang
    // 关闭free trail - 2023-10-17 - @HuangSong
    // 根据后端返回的role是否为free_trail判断是否开启，5次 - 2024-07-03 - @HuangSong
    ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES: 5,
    // 根据后端返回的role是否为free_trail判断是否开启，5次 - 2024-07-03 - @HuangSong
    ON_BOARDING_RECORD_INSTANT_REPLY_FREE_TRIAL_TIMES: 5,
    ON_BOARDING_MAXAI_3_0: false,

    // sidebar 中 survey dialog 是否弹窗过的标记
    ON_BOARDING_EXTENSION_SURVEY_DIALOG_ALERT: false,

    // sidebar 中 update modal 是否弹窗过的标记
    // 4.3.8需要对所有用户都显示update modal - @huangsong
    // 如果用户没有看到4.3.8的update modal直接升级到4.3.9，还是需要让改用户看到一次4.3.8的update modal - @huangsong
    ON_BOARDING_EXTENSION_VERSION_4_3_8_UPDATE_MODAL: false,
    ON_BOARDING_EXTENSION_VERSION_4_6_1_UPDATE_MODAL: false,
    ON_BOARDING_EXTENSION_VERSION_4_8_0_UPDATE_MODAL: false,
    ON_BOARDING_EXTENSION_VERSION_4_8_2_UPDATE_MODAL: false,
  }
  /**
   * InputAssistantButton onBoarding Keys
   * @since 2023-10-09 - 为Help me write的各个button添加lifetime的5次free trial - @HuangSong
   * @update - 关闭free trail - 2023-10-17 - @HuangSong
   */
  InputAssistantButtonGroupConfigHostKeys.forEach((key) => {
    onBoardingMap[
      `ON_BOARDING_RECORD_INPUT_ASSISTANT_BUTTON_${key}_TIMES` as OnBoardingKeyType
    ] = 0
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
