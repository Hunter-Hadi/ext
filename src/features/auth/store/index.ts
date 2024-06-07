import { atom } from 'recoil'

import { IMaxAIBetaFeatures } from '@/background/utils/maxAIBetaFeatureSettings/constant'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
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

export const DailyLimitState = atom<{
  show: boolean
  barHeight: number
}>({
  key: 'DailyLimitState',
  default: {
    show: false,
    barHeight: 0,
  },
})

export const MaxAIBetaFeaturesState = atom<{
  loaded: boolean
  features: IMaxAIBetaFeatures
}>({
  key: 'MaxAIBetaFeaturesState',
  default: {
    loaded: false,
    features: {},
  },
})

export const PricingModalState = atom<{
  show: boolean
  conversationId?: string
  permissionSceneType?: PermissionWrapperCardSceneType
}>({
  key: 'PricingModalState',
  default: {
    show: false,
  },
})
