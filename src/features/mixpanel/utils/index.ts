/**
 * Mix Panel tracking 相关 code
 *
 * docs: https://docs.mixpanel.com/docs/quickstart/connect-your-data?sdk=javascript
 */
import mixpanel from 'mixpanel-browser'

import { isProduction } from '@/constants'
import {
  getChromeExtensionUserInfo,
  getMaxAIWebSiteClientUserId,
} from '@/features/auth/utils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'

export const MIXPANEL_PROJECT_ID = String(process.env.MIXPANEL_PROJECT_ID)

const initMixPanel = () => {
  if (!MIXPANEL_PROJECT_ID) {
    return
  }
  mixpanel.init(MIXPANEL_PROJECT_ID, {
    debug: isProduction ? false : true,
    track_pageview: false,
    persistence: 'localStorage',
  })
}

export const useInitMixPanel = () => {
  useEffectOnce(() => {
    initMixPanel()
    getMaxAIWebSiteClientUserId().then((clientUserId) => {
      if (clientUserId) {
        // Set this to a unique identifier for the user performing the event.
        mixpanelIdentify('identify', clientUserId)
      }
    })
  })

  return null
}

export const mixpanelTrack = async (
  eventName: string,
  params?: Record<string, any>,
) => {
  try {
    const paramsCover = { ...params, ...(await trackParamsWithUserInfo()) }

    console.log(`mixpanel.track eventName: `, eventName, paramsCover)
    mixpanel.track(eventName, paramsCover)
  } catch (e) {
    // do nothing
  }
}

export const mixpanelIdentify = (
  type: 'identify' | 'reset',
  userId?: string,
) => {
  initMixPanel()
  try {
    if (type === 'identify' && userId) {
      mixpanel.identify(userId)
    }
    if (type === 'reset') {
      mixpanel.reset()
    }
  } catch (e) {
    // do nothing
  }
}

const trackParamsWithUserInfo = async () => {
  const userInfo = await getChromeExtensionUserInfo(false)

  // guest 代表未登录的用户
  const currentRole = userInfo?.role?.name ?? 'guest'
  let currentPlan = userInfo?.role?.subscription_plan_name ?? 'GUEST' // 由于后端返回的值都是大写的，这里统一大写

  // 但是当用户为 free 时，后端返回的 subscription_plan_name 为 null
  // 所以这里需要处理，currentPlan === 'GUEST' && currentRole === 'free' 的情况
  if (
    currentPlan === 'GUEST' &&
    (currentRole === 'free' ||
      currentRole === 'new_user' ||
      currentRole === 'pro_gift')
  ) {
    currentPlan = 'FREE'
  }

  return {
    currentPlan,
    currentRole,
  }
}
