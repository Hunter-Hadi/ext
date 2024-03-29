import { InputAssistantButtonElementRouteMap } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import {
  discordGetChatMessages,
  discordGetDraftContent,
} from '@/features/shortcuts/utils/chat/platforms/discord'
import {
  slackGetChatMessages,
  slackGetDraftContent,
} from '@/features/shortcuts/utils/chat/platforms/slack'
import {
  whatsAppGetChatMessages,
  whatsAppGetDraftContent,
} from '@/features/shortcuts/utils/chat/platforms/whatsApp'
import ChatMessagesContext, {
  type IChatMessagesContextData,
} from '@/features/shortcuts/utils/ChatMessagesContext'
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
  }
  return ''
}
