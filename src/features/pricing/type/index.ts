// pricing 支持购买的 plan 类型
export type RENDER_PLAN_TYPE =
  | 'free' // 免费版
  | 'basic' // basic 月付 个人版
  | 'basic_yearly' // basic 年付 个人版
  | 'basic_team' // basic 月付 团队版
  | 'basic_one_year' // basic 一年版
  | 'pro' // pro 月付 个人版
  | 'pro_yearly' // pro 年付 个人版
  | 'pro_one_year' // pro 一年版
  | 'pro_team' // pro 月付 团队版
  | 'elite' // elite 月付 个人版
  | 'elite_yearly' // elite 年付 个人版
  | 'elite_one_year' // elite 一年版
  | 'elite_team' // elite 月付 team 版本

// 支付方式
export type IPaymentType = 'yearly' | 'monthly'

export type IPricingPlanCategory = 'individual' | 'team'

export type IPaymentSubscriptionMethod =
  | 'card'
  | 'cashapp'
  | 'link'
  | 'us_bank_account'
  | 'amazon_pay'
  | 'alipay'

export type IPaymentOnetimeMethod = 'affirm' | 'wechat_pay' | 'klarna'

export type IPaymentMethod = IPaymentSubscriptionMethod | IPaymentOnetimeMethod

// plan pricing信息
export type IPlanPricingInfo = {
  // 这个字段接口没有，前端的type目前是没有monthly，basic/pro/elite就代表的是monthly
  type: RENDER_PLAN_TYPE
  price_id: string
  dev_price_id: string
  price: number
  discount_title?: string | null
  discount_value?: number | null
  promotion_code?: string | null
}
