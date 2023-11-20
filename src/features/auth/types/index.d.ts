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
export type IUserRole = {
  name: IUserRoleType
  exp_time: number
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
