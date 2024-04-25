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
    track_pageview: true,
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
    const paramsCover = { ...params }
    const userInfo = await getChromeExtensionUserInfo(false)
    if (userInfo?.role?.name) {
      paramsCover['role'] = userInfo.role.name
    }

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
