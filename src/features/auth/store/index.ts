import { atom } from 'recoil'

import { IUseChatGPTUserInfo } from '@/features/auth/types'

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
