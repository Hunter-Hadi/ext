import { ISocialMediaPostContextData } from '@/features/shortcuts/utils/SocialMediaPostContext'
import { ISidebarConversationType } from '@/features/sidebar/types'

export type GetSocialMediaPostContentFunction = (
  inputAssistantButton: HTMLElement,
  type?:ISidebarConversationType
) => Promise<ISocialMediaPostContextData>

export type GetSocialMediaPostDraftFunction = (
  inputAssistantButton: HTMLElement,
) => string
