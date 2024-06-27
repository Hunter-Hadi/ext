import { type TFunction } from 'i18next'

export type IUpdateVariant =
  | 'gpt-4o'
  | 'claude-3-opus'
  | 'claude-3.5-sonnet'
  | 'gemini-1.5-pro'
  | 'art'
  | 'summary'
  | 'instant-reply'
  | 'search'
  | 'rewriter'
  | 'prompts'
  | 'translator'
  | 'vision'

export type IUpdateVariantConfig = {
  image: string
  title: (t: TFunction<['client']>) => string
  descriptions: (
    t: TFunction<['client']>,
  ) => { title?: string; description: string }[]
  learnMoreLink?: string
}

// 当前update modal弹窗针对哪些用户显示
// 所有用户 / 免费用户
export type IUpdateVariantShowType = 'all' | 'free'

export type IPaywallVariant = '3-1' | '3-2'

export type IUserABTestInfo = {
  paywallVariant?: IPaywallVariant
}
