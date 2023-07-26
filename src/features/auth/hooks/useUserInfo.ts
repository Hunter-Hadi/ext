import { useRecoilValue } from 'recoil'
import { AuthUserInfoState } from '@/features/auth/store'
import { useMemo } from 'react'
import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { IUserRoleType } from '@/features/auth/types'

export type IUserCurrentPlan = {
  name: IUserRoleType
}

const useUserInfo = () => {
  const { user: userInfo, loading } = useRecoilValue(AuthUserInfoState)
  const { syncUserInfo, syncUserSubscriptionInfo } = useInitUserInfo(false)
  const quotaLeftText = useMemo(() => {
    if (userInfo?.chatgpt_expires_at) {
      const expiresAt = new Date(userInfo.chatgpt_expires_at)
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()
      const days = Math.ceil(diff / (1000 * 3600 * 24))
      const weeks = Math.floor(days / 7)
      const remainDays = Math.ceil(days % 7)
      let remainDaysText = ''
      if (remainDays > 0) {
        remainDaysText =
          '& ' + remainDays + ' day' + (remainDays > 1 ? 's' : '')
      }
      if (weeks < 1) {
        if (days <= 0) {
          if (diff < 0) {
            return '0'
          }
          return '1 day'
        }
        if (days < 2) {
          return `${days} day`
        }
        return `${days} days`
      }
      if (weeks < 2) {
        return `${weeks} week ${remainDaysText}`
      }
      return `${weeks} weeks ${remainDaysText}`
    }
    return 0
  }, [userInfo])
  const currentUserPlan = useMemo<IUserCurrentPlan>(() => {
    let name: IUserRoleType = userInfo?.role?.name || ('free' as IUserRoleType)
    if (userInfo?.chatgpt_expires_at) {
      // check is pro gift
      if (
        name === 'free' &&
        new Date(userInfo.chatgpt_expires_at).getTime() > new Date().getTime()
      ) {
        name = 'pro_gift'
      }
    }
    return {
      name,
    }
  }, [userInfo])
  return {
    currentUserPlan,
    quotaLeftText,
    userInfo,
    loading,
    syncUserInfo,
    syncUserSubscriptionInfo,
  }
}
export { useUserInfo }
