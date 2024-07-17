/**
 * 后端只有:free,basic,pro,elite
 * 前端通过不同的过期时间来区分: free, new_user, pro, pro_gift,elite
 */
export type IUserRoleType =
  | 'free'
  | 'free_trial'
  | 'new_user'
  | 'pro_gift'
  | 'basic'
  | 'pro'
  | 'elite'

export type IUserPlanNameType =
  | 'BASIC_MONTHLY'
  | 'BASIC_YEARLY'
  | 'BASIC_TEAM_MONTHLY'
  | 'BASIC_ONE_YEAR'
  | 'PRO_MONTHLY'
  | 'PRO_YEARLY'
  | 'PRO_TEAM_MONTHLY'
  | 'PRO_ONE_YEAR'
  | 'ELITE_MONTHLY'
  | 'ELITE_YEARLY'
  | 'ELITE_TEAM_MONTHLY'
  | 'ELITE_ONE_YEAR'
  | 'UNKNOWN'
// 这是手动算出来的数据结构，方便插件内用
export type IUserRole = {
  name: IUserRoleType
  exp_time: number
  // 是否为一次付费用户
  is_one_times_pay_user: boolean
  subscription_plan_name: IUserPlanNameType
}

export type IUseChatGPTUserInfo = {
  role?: IUserRole
  chatgpt_expires_at: string
  email: string
  referral_code: string
  referred_cnt: null | number
  created_at: string
  roles: IUserRole[]
  subscription_plan_name: IUserPlanNameType
  group_id?: string
  // 用户第一次付费的时间戳（单位: 秒）
  subscribed_at?: number | null
  subscription_payment_failed_at?: null | number
  subscription_type: 'SUBSCRIPTION' | 'ONE_TIME'
  // 用户取消订阅的 utc 时间， 示例：2024-06-05T06:31:36.590000+00:00
  subscription_canceled_at?: string | null

  client_user_id?: string | null
  user_id?: string | null
  user_status?: {
    register_version: string
  }
}

export type IUserQuotaUsageInfo = {
  fastText: number
  advancedText: number
  imageGenerate: number

  nextRefreshTime?: string // 用量刷新的时间 (utc)
}

export type IUserFeatureQuotaInfo = {
  // 每日用量上限
  summarizePageMaxCnt: number
  summarizePDFMaxCnt: number
  summarizeYoutubeMaxCnt: number
  contextMenuMaxCnt: number
  searchMaxCnt: number
  instantReplyMaxCnt: number
  // 用量检测时间
  checkTime: string
  // 用量刷新时间
  refreshTime: string
  // 当日用量，每日重置
  summarizePageUsage: number
  summarizePDFUsage: number
  summarizeYoutubeUsage: number
  contextMenuUsage: number
  searchUsage: number
  instantReplyUsage: number
}
