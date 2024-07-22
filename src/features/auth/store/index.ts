import { atom } from 'recoil'

import { IMaxAIBetaFeatures } from '@/background/utils/maxAIBetaFeatureSettings/constant'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import {
  IUseChatGPTUserInfo,
  IUserFeatureQuotaInfo,
  IUserQuotaUsageInfo,
} from '@/features/auth/types'

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
  loaded: boolean
  fetching: boolean
}>({
  key: 'AuthUserInfoState',
  default: {
    user: null,
    loading: false,
    loaded: false,
    fetching: false,
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

export const UserFeatureQuotaState = atom<
  IUserFeatureQuotaInfo & { loading: boolean }
>({
  key: 'UserFeatureQuotaState',
  default: {
    loading: false,
    // 每日用量上限
    summarizePageMaxCnt: 0,
    summarizePDFMaxCnt: 0,
    summarizeYoutubeMaxCnt: 0,
    contextMenuMaxCnt: 100,
    searchMaxCnt: 0,
    instantReplyMaxCnt: 0,
    // 用量检测时间
    checkTime: '',
    // 用量刷新时间
    refreshTime: '',
    // 当日用量，每日重置
    summarizePageUsage: 0,
    summarizePDFUsage: 0,
    summarizeYoutubeUsage: 0,
    contextMenuUsage: 0,
    searchUsage: 0,
    instantReplyUsage: 0,
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
