import { InputAssistantButtonElementRouteMap } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import {
  facebookGetDraftContent,
  facebookGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/facebook'
import {
  instagramGetDraftContent,
  instagramGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/instagram'
import {
  linkedInGetDraftContent,
  linkedInGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/linkedIn'
import {
  redditGetDraftContent,
  redditGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/reddit'
import {
  twitterGetDraftContent,
  twitterGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/twitter'
import {
  youTubeGetDraftContent,
  youTubeGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/youtube'
import {
  youTubeStudioGetDraftContent,
  youTubeStudioGetPostContent,
} from '@/features/shortcuts/utils/socialMedia/platforms/youtubeStudio'
import SocialMediaPostContext, {
  ISocialMediaPostContextData,
} from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const getSocialMediaPostContent = async (
  inputAssistantButtonElementSelector: string,
): Promise<ISocialMediaPostContextData> => {
  const inputAssistantButton = (InputAssistantButtonElementRouteMap.get(
    inputAssistantButtonElementSelector,
  ) ||
    document.querySelector(
      inputAssistantButtonElementSelector,
    )) as HTMLButtonElement

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
  if (host === 'studio.youtube.com') {
    return await youTubeStudioGetPostContent(inputAssistantButton)
  }
  if (host === 'instagram.com') {
    return await instagramGetPostContent(inputAssistantButton)
  }
  if (host === 'reddit.com') {
    return await redditGetPostContent(inputAssistantButton)
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
    return youTubeGetDraftContent(inputAssistantButton)
  }
  if (host === 'studio.youtube.com') {
    return youTubeStudioGetDraftContent(inputAssistantButton)
  }
  if (host === 'instagram.com') {
    return instagramGetDraftContent(inputAssistantButton)
  }
  if (host === 'reddit.com') {
    return await redditGetDraftContent(inputAssistantButton)
  }
  return ''
}
