import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const messengerGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  username: string,
) => {
  const messages: IChatMessageData[] = []
  for (const messageBox of messageBoxList) {
    // const usernameBlock = messageBox.querySelector<HTMLElement>(
    //   '[data-qa="message_sender_name"]',
    // )
    // if (usernameBlock) {
    //   username = usernameBlock.innerText
    // }
    // // if doesn't have username, it means the data capture is not successful, need to relocate the usernameBlock selector
    // if (username) {
    //   const { datetime, messageContent, extraLabel } =
    //     slackGetChatMessageContentAndDate(messageBox, username)
    //   messages.push({
    //     user: username,
    //     datetime,
    //     content: messageContent,
    //     extraLabel,
    //   })
    // }
  }
  return messages
}

export const messengerGetChatMessages = (inputAssistantButton: HTMLElement) => {
  return ChatMessagesContext.emptyData
}

export const messengerGetDraftContent = (inputAssistantButton: HTMLElement) => {
  // const slackDraftEditor = findSelectorParent(
  //   '[data-qa="message_input"] > .ql-editor',
  //   inputAssistantButton,
  //   5,
  // )
  // return slackDraftEditor?.innerText || ''
  return ''
}
