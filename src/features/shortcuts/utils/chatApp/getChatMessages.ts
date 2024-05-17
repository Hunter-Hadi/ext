import { InputAssistantButtonElementRouteMap } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import ChatMessagesContext, {
  type IChatMessagesContextData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  discordGetChatMessages,
  discordGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/discord'
import {
  linkedInGetChatMessages,
  linkedInGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/linkedIn'
import {
  messengerGetChatMessages,
  messengerGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/messenger'
import {
  slackGetChatMessages,
  slackGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/slack'
import {
  telegramGetChatMessages,
  telegramGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/telegram'
import {
  whatsAppGetChatMessages,
  whatsAppGetDraftContent,
} from '@/features/shortcuts/utils/chatApp/platforms/whatsApp'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export const getChatMessagesContent = async (
  inputAssistantButtonElementSelector: string,
): Promise<IChatMessagesContextData> => {
  const inputAssistantButton = (InputAssistantButtonElementRouteMap.get(
    inputAssistantButtonElementSelector,
  ) ||
    document.querySelector(
      inputAssistantButtonElementSelector,
    )) as HTMLButtonElement

  if (inputAssistantButton) {
    const host = getCurrentDomainHost()
    if (host === 'discord.com') {
      return await discordGetChatMessages(inputAssistantButton)
    }
    if (host === 'app.slack.com') {
      return await slackGetChatMessages(inputAssistantButton)
    }
    if (host === 'web.whatsapp.com') {
      return await whatsAppGetChatMessages(inputAssistantButton)
    }
    if (host === 'web.telegram.org') {
      return await telegramGetChatMessages(inputAssistantButton)
    }
    if (host === 'messenger.com') {
      return await messengerGetChatMessages(inputAssistantButton)
    }
    if (host === 'linkedin.com') {
      return await linkedInGetChatMessages(inputAssistantButton)
    }
  }
  return ChatMessagesContext.emptyData
}

export const getChatMessageDraftContent = async (
  inputAssistantButtonElementSelector: string,
) => {
  const inputAssistantButton = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement

  if (inputAssistantButton) {
    const host = getCurrentDomainHost()
    if (host === 'discord.com') {
      return await discordGetDraftContent(inputAssistantButton)
    }
    if (host === 'app.slack.com') {
      return await slackGetDraftContent(inputAssistantButton)
    }
    if (host === 'web.whatsapp.com') {
      return await whatsAppGetDraftContent(inputAssistantButton)
    }
    if (host === 'web.telegram.org') {
      return await telegramGetDraftContent(inputAssistantButton)
    }
    if (host === 'messenger.com') {
      return await messengerGetDraftContent(inputAssistantButton)
    }
    if (host === 'linkedin.com') {
      return await linkedInGetDraftContent(inputAssistantButton)
    }
  }
  return ''
}
