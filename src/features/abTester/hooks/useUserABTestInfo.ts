/**
 * 用于paywall展示的时候A/B test是否显示弹窗
 */
import { useCallback, useEffect, useState } from 'react'

import { IUserABTestInfo } from '@/features/abTester/types'
import {
  generatePaywallVariant,
  getChromeExtensionUserABTest,
  saveChromeExtensionUserABTest,
} from '@/features/abTester/utils'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useFocus } from '@/features/common/hooks/useFocus'

const useUserABTestInfo = () => {
  const { userInfo } = useUserInfo()
  const [abTestInfo, setABTestInfo] = useState<IUserABTestInfo>({})

  const userId = (userInfo as any)?.user_id

  const handleInit = useCallback(async () => {
    if (userId) {
      getChromeExtensionUserABTest(userId).then((result) => {
        if (!result.paywallVariant) {
          result.paywallVariant = generatePaywallVariant()
          saveChromeExtensionUserABTest(userId, result)
        }
        setABTestInfo(result)
      })
    }
  }, [userId])

  useEffect(() => {
    handleInit()
  }, [handleInit])

  /**
   * focus去同步下状态
   */
  useFocus(handleInit)

  return {
    userId,
    abTestInfo,
  }
}

export default useUserABTestInfo
