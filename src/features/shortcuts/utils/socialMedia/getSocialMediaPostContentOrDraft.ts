import { getCurrentDomainHost } from '@/utils'
import SocialMediaPostContext, {
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/SocialMediaPostContext'
import {
  twitterGetDraftContent,
  twitterGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/twitter'
import {
  linkedInGetDraftContent,
  linkedInGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/linkedIn'
import {
  facebookGetDraftContent,
  facebookGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/facebook'
import {
  youTubeGetDraftContent,
  youTubeGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/youtube'

export const getSocialMediaPostContent = async (
  inputAssistantButtonElementSelector: string,
): Promise<ISocialMediaPostContextData> => {
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement

  if (!inputAssistantButton) {
    return SocialMediaPostContext.emptyData
  }
  const host = getCurrentDomainHost()
  if (host === 'twitter.com') {
    return await twitterGetPostContent(inputAssistantButton)
  }
  if (host === 'linkedin.com') {
    return await linkedInGetPostContent(inputAssistantButton)
  }
  if (host === 'facebook.com') {
    return await facebookGetPostContent(inputAssistantButton)
  }
  if (host === 'youtube.com') {
    return await youTubeGetPostContent(inputAssistantButton)
  }
  return SocialMediaPostContext.emptyData
}

export const getSocialMediaPostDraft = async (
  inputAssistantButtonElementSelector: string,
) => {
  const host = getCurrentDomainHost()
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement
  if (!inputAssistantButton) {
    return ''
  }
  if (host === 'twitter.com') {
    return twitterGetDraftContent(inputAssistantButton)
  }
  if (host === 'linkedin.com') {
    return linkedInGetDraftContent(inputAssistantButton)
  }
  if (host === 'facebook.com') {
    return facebookGetDraftContent(inputAssistantButton)
  }
  if (host === 'youtube.com') {
    return await youTubeGetDraftContent(inputAssistantButton)
  }
  return ''
}
