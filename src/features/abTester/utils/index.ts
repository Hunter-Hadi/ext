import Browser from 'webextension-polyfill'

import {
  CHROME_EXTENSION_USER_ABTEST_SAVE_KEY,
  PAYWALL_VARIANT,
} from '@/features/abTester/constants'
import { IPaywallVariant, IUserABTestInfo } from '@/features/abTester/types'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'

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

export const getChromeExtensionUserABTest = async (
  userId: string,
): Promise<IUserABTestInfo> => {
  const usersABTest = await getChromeExtensionUsersABTest()
  return usersABTest[userId] || {}
}

export const saveChromeExtensionUserABTest = async (
  userId: string,
  abTestInfo: IUserABTestInfo,
) => {
  try {
    const usersABTest = await getChromeExtensionUsersABTest()
    await getChromeExtensionUserABTest(userId)
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

export const generatePaywallVariant = () => {
  return PAYWALL_VARIANT[Date.now() % PAYWALL_VARIANT.length]
}

export const getPaywallVariant = async (
  userId?: string,
): Promise<IPaywallVariant> => {
  if (!userId) {
    userId = await getMaxAIChromeExtensionUserId()
  }

  if (!userId) {
    return '1-1'
  }

  const abTestInfo = await getChromeExtensionUserABTest(userId)

  if (!abTestInfo.paywallVariant) {
    abTestInfo.paywallVariant =
      PAYWALL_VARIANT[Date.now() % PAYWALL_VARIANT.length]
    saveChromeExtensionUserABTest(userId, abTestInfo)
  }
  return abTestInfo.paywallVariant
}
