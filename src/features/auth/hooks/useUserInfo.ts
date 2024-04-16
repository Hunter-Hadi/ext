import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { AuthUserInfoState, UserQuotaUsageState } from '@/features/auth/store'
import { IUserPlanNameType, IUserRoleType } from '@/features/auth/types'

export type IUserCurrentPlan = {
  name: IUserRoleType
  isNewUser?: boolean
  planName?: IUserPlanNameType
  isOneTimePayUser: boolean
}

const useUserInfo = () => {
  const { user: userInfo, loading } = useRecoilValue(AuthUserInfoState)
  const userQuotaUsage = useRecoilValue(UserQuotaUsageState)
  const { syncUserInfo, syncUserSubscriptionInfo, syncUserQuotaUsageInfo } =
    useInitUserInfo(false)
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
    const planName: IUserPlanNameType | undefined =
      userInfo?.role?.subscription_plan_name || userInfo?.subscription_plan_name
    let isNewUser = false
    if (userInfo?.chatgpt_expires_at) {
      // check is pro gift
      if (
        name === 'free' &&
        new Date(userInfo.chatgpt_expires_at).getTime() > new Date().getTime()
      ) {
        name = 'pro_gift'
      }
    }
    // 判断是否是新用户 - 7天内注册的用户
    if (name === 'free' && userInfo?.created_at) {
      const created_at = dayjs(userInfo?.created_at)
      const now = dayjs().utc()
      const diffDays = now.diff(created_at, 'day')
      // 把“注册7天后在显示付费卡点”改为0天（也就是立刻就出现付费卡点）- 2023-08-09 - @huangsong
      const NEW_USER_DAYS = -100000
      if (diffDays <= NEW_USER_DAYS) {
        name = 'new_user'
        isNewUser = true
      }
      console.log('created account days', diffDays)
    }
    return {
      planName,
      name,
      isNewUser,
      isOneTimePayUser: userInfo?.role?.is_one_times_pay_user || false,
    }
  }, [userInfo])

  // 是否是付费用户
  const isPayingUser = useMemo(() => {
    return (
      currentUserPlan.name === 'pro' ||
      currentUserPlan.name === 'elite' ||
      currentUserPlan.name === 'basic'
    )
  }, [currentUserPlan])

  return {
    currentUserPlan,
    quotaLeftText,
    userInfo,
    loading,
    syncUserInfo,
    syncUserSubscriptionInfo,

    userQuotaUsage,
    syncUserQuotaUsageInfo,

    isPayingUser,
  }
}
export { useUserInfo }
