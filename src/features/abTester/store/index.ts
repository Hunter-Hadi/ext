import { atom } from 'recoil'

import { IUserABTestInfo } from '@/features/abTester/types'

export const UserABTestInfoState = atom<Partial<IUserABTestInfo>>({
  key: 'ABTestInfo',
  default: {},
})
