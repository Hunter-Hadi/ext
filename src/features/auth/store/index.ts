import { atom } from 'recoil'

import { IUseChatGPTUserInfo, IUserQuotaUsageInfo } from '@/features/auth/types'

export const AuthState = atom<{
  isLogin: boolean
}>({
  key: 'AuthState',
  default: {
    isLogin: false,
  },
})

export const AuthUserInfoState = atom<{
  user: IUseChatGPTUserInfo | null
  loading: boolean
}>({
  key: 'AuthUserInfoState',
  default: {
    user: null,
    loading: false,
  },
})

export const UserQuotaUsageState = atom<
  IUserQuotaUsageInfo & { loading: boolean }
>({
  key: 'UserQuotaUsageState',
  default: {
    fastText: 0,
    advancedText: 0,
    imageGenerate: 0,
    loading: false,
    // nextRefreshTime: '',
  },
})
