/**
 * 用于paywall展示的时候A/B test是否显示弹窗
 */
import { useCallback, useEffect } from 'react'
import { useRecoilState } from 'recoil'

import { UserABTestInfoState } from '@/features/abTester/store'
import { getChromeExtensionUserABTest } from '@/features/abTester/utils'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useFocus } from '@/features/common/hooks/useFocus'

const useUserABTestInfo = () => {
  const { userInfo } = useUserInfo()
  const [abTestInfo, setABTestInfo] = useRecoilState(UserABTestInfoState)

  const userId = (userInfo as any)?.user_id

  const handleInit = useCallback(async () => {
    const info = await getChromeExtensionUserABTest(userId)
    setABTestInfo(info)
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
