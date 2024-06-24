import { atom } from 'recoil'

import { PLAN_PRICING_MAP } from '@/features/pricing/constants'

export const CreateSessionLoadingAtom = atom<boolean>({
  key: 'CreateSessionLoadingAtom',
  default: false,
})

export const PlanPricingInfoAtom = atom({
  key: 'PlanPricingInfoAtom',
  default: {
    loading: false,
    data: PLAN_PRICING_MAP,
  },
})
