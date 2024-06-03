import { atom } from 'recoil'

export const UnableSubscriptionState = atom<{
  show: boolean
  barHeight: number
}>({
  key: 'UnableSubscriptionState',
  default: {
    show: false,
    barHeight: 0,
  },
})
