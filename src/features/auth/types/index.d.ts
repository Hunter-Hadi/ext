export type IUserRoleType = 'free' | 'pro'

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
}
