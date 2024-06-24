import { atom } from 'recoil'

import { IUserABTestInfo } from '@/features/abTester/types'

export const UserABTestInfoState = atom<Partial<IUserABTestInfo>>({
  key: 'UserABTestInfo',
  default: {},
})
