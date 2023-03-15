import { atom } from 'recoil'
import { getClientEnv } from '@/utils'

export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
}>({
  key: 'AppState',
  default: {
    env: getClientEnv(),
    open: false,
  },
})
