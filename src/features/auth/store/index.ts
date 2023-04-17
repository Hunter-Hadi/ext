import { atom } from 'recoil'

export const AuthState = atom<{
  isLogin: boolean
}>({
  key: 'AuthState',
  default: {
    isLogin: false,
  },
})
