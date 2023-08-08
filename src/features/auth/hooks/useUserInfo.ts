import { useRecoilValue } from 'recoil'
import { AuthUserInfoState } from '@/features/auth/store'
import { useMemo } from 'react'
import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import dayjs from 'dayjs'

export type IUserCurrentPlan = {
  name: IUserRoleType
  isNewUser?: boolean
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
    if (userInfo?.roles?.length) {
      const pro = userInfo.roles.find((item) => item.name === 'pro')
      if (pro) {
        name = 'pro'
      }
    }
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
    if (userInfo?.created_at) {
      const created_at = dayjs(userInfo?.created_at)
      const now = dayjs().utc()
      const diffDays = now.diff(created_at, 'day')
      console.log('created account days', diffDays, created_at)
      if (diffDays <= 7) {
        isNewUser = true
      }
    }
    return {
      name,
      isNewUser,
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
