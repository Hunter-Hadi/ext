import { type TFunction } from 'i18next'

export type IUpdateVariant =
  | 'gpt-4o'
  | 'claude-3-opus'
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
}

export type IPaywallVariant = '2-1' | '2-2'

export type IUserABTestInfo = {
  paywallVariant?: IPaywallVariant
}
