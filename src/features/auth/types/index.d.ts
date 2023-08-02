/**
 * 后端只有:free,pro
 * 前端通过不同的过期时间来区分: free, new_user, pro, pro_gift
 */
export type IUserRoleType = 'free' | 'new_user' | 'pro' | 'pro_gift'

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
}
