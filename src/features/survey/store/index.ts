import { atom } from 'recoil'

import { ISurveyKeyType } from '@/features/survey/types'

// 保存 是否填写过问卷的状态
export const HaveFilledOutSurveyAtom = atom<
  Partial<Record<ISurveyKeyType, boolean>>
>({
  key: 'HaveFilledOutSurveyAtom',
  default: {
    feedback: false,
  },
})

// 第一次 fetch survey 状态，是否结束
export const FirstFetchSurveyStatusLoadedAtom = atom<boolean>({
  key: 'firstFetchSurveyStatusLoadedAtom',
  default: false,
})
