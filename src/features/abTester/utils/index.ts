import Browser from 'webextension-polyfill'

import {
  CHROME_EXTENSION_USER_ABTEST_SAVE_KEY,
  PAYWALL_VARIANT,
} from '@/features/abTester/constants'
import { IUserABTestInfo } from '@/features/abTester/types'
import {
  getMaxAIChromeExtensionUserId,
  getMaxAIWebSiteClientUserId,
} from '@/features/auth/utils'

export const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const generateABTestInfo = (): IUserABTestInfo => {
  return {
    paywallVariant:
      PAYWALL_VARIANT[generateRandomNumber(0, PAYWALL_VARIANT.length - 1)],
  }
}

/**
 * 获取本地保存所有用户的abtest信息
 */
export const getChromeExtensionUsersABTest = async (): Promise<
  Record<string, IUserABTestInfo>
> => {
  try {
    const local = await Browser.storage.local.get(
      CHROME_EXTENSION_USER_ABTEST_SAVE_KEY,
    )
    if (local[CHROME_EXTENSION_USER_ABTEST_SAVE_KEY]) {
      return JSON.parse(local[CHROME_EXTENSION_USER_ABTEST_SAVE_KEY]) || {}
    }
  } catch (e) {
    console.error(e)
  }
  return {}
}

/**
 * 获取本地保存用户的abtest信息
 */
export const getChromeExtensionUserABTest = async (
  userId?: string,
): Promise<IUserABTestInfo> => {
  const usersABTest = await getChromeExtensionUsersABTest()

  if (!userId) {
    // 获取用户id
    userId = await getMaxAIChromeExtensionUserId()
  }
  if (!userId) {
    // 获取client user id
    userId = await getMaxAIWebSiteClientUserId()
  }
  if (!userId) {
    // 生成一个userId
    userId = 'guest'
  }

  const abTestInfo = usersABTest[userId] || {}

  // 在generateABTestInfo里加入新的key并在下方添加新的判断
  // if (!abTestInfo.xx1 || !abTestInfo.xx2) {
  if (!abTestInfo.paywallVariant) {
    Object.assign(abTestInfo, {
      ...generateABTestInfo(),
      ...abTestInfo,
    })
    await saveChromeExtensionUserABTest(userId, abTestInfo)
  }

  return abTestInfo
}

/**
 * 修改本地保存用户的abtest信息
 * @param userId
 * @param abTestInfo
 */
export const saveChromeExtensionUserABTest = async (
  userId: string,
  abTestInfo: IUserABTestInfo,
) => {
  try {
    const usersABTest = await getChromeExtensionUsersABTest()
    await Browser.storage.local.set({
      [CHROME_EXTENSION_USER_ABTEST_SAVE_KEY]: JSON.stringify({
        ...usersABTest,
        [userId]: abTestInfo,
      }),
    })
    return true
  } catch (e) {
    return false
  }
}
