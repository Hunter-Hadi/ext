import { ISocialMediaPostContextData } from '@/features/shortcuts/utils/SocialMediaPostContext'

export type GetSocialMediaPostContentFunction = (
  inputAssistantButton: HTMLElement,
) => Promise<ISocialMediaPostContextData>

export type GetSocialMediaPostDraftFunction = (
  inputAssistantButton: HTMLElement,
) => string
