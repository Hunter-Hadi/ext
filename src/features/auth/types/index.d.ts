/**
 * 后端只有:free,pro,elite
 * 前端通过不同的过期时间来区分: free, new_user, pro, pro_gift,elite
 */
export type IUserRoleType = 'free' | 'new_user' | 'pro' | 'pro_gift' | 'elite'
export type IUserPlanNameType =
  | 'PRO_MONTHLY'
  | 'PRO_YEARLY'
  | 'ELITE_MONTHLY'
  | 'ELITE_YEARLY'
  | 'PRO_ONE_YEAR'
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
}
