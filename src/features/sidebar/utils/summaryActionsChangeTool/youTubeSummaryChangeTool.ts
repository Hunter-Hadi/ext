import { findLastIndex } from 'lodash-es'
import { cloneDeep, orderBy } from 'lodash-es'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { youTubeGetPostCommentsInfo } from '@/features/shortcuts/utils/socialMedia/platforms/youtube'

import { SummaryParamsPromptType } from '../pageSummaryNavPrompt'
export const youTubeSummaryCommentsChangeTool = async (
  actions: ISetActionsType,
) => {
  try {
    const askChatGptIndex = actions.findIndex(
      (item) => item.type === 'ASK_CHATGPT',
    )
    const commentsInfo = await youTubeGetPostCommentsInfo()

    if (commentsInfo?.commitList.length === 0 || !commentsInfo) {
      //当没有评论直接显示无
      actions = actions.filter(
        (action) =>
          action.type !== 'ASK_CHATGPT' &&
          action.type !== 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE' &&
          action.type !== 'ANALYZE_CHAT_FILE',
      )
      actions.push({
        type: 'CHAT_MESSAGE',
        parameters: {
          ActionChatMessageOperationType: 'update',
          ActionChatMessageConfig: {
            type: 'ai',
            messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            text: '',
            originalMessage: {
              content: {
                title: {
                  title: 'Summary',
                },
                text: '**No comments found 😶**',
                contentType: 'text',
              },
              includeHistory: false,
            },
          } as IAIResponseMessage,
        },
      })
      return actions
    }
    const sortedComments = orderBy(
      commentsInfo?.commitList ?? [],
      (item) => {
        const value = item.like
        if (value && value.endsWith('K')) {
          return Number(value.slice(0, -1)) * 1000
        }
        return Number(value)
      },
      ['desc'],
    ) //对like排序
    const commentText = sortedComments
      .map((comment) => {
        return `**${comment.author}** ${
          comment.like !== '0' ? '👍' + comment.like : ''
        }\n  ${comment.content}\n`
      })
      .join('\n')

    const actionSetTemplateList: ISetActionsType = [
      {
        type: 'RENDER_TEMPLATE',
        parameters: {
          template: `#### Top Comment
   _TL;DR_ **{{SUMMARY_CONTENTS}}**
   
  ${commentText}
                `,
        },
      },
    ]
    actions.splice(askChatGptIndex + 2, 0, ...actionSetTemplateList)
    const lastChatMessageIndex = findLastIndex(
      actions,
      (item) => item.type === 'CHAT_MESSAGE',
    )
    const lastChatMessageAction = actions?.[lastChatMessageIndex]
    if (lastChatMessageAction?.parameters?.ActionChatMessageConfig) {
      lastChatMessageAction.parameters.ActionChatMessageConfig.text = `{{LAST_ACTION_OUTPUT}}`
      const originalMessage = (lastChatMessageAction?.parameters
        ?.ActionChatMessageConfig as IAIResponseMessage).originalMessage
      if (originalMessage) {
        originalMessage.content = {
          text: `{{LAST_ACTION_OUTPUT}}`,
          title: {
            title: 'Summary',
          },
          contentType: 'text',
        }
      }
    }
    return cloneDeep(actions)
  } catch (e) {
    return actions
  }
}
export const youTubeSummaryChangeTool = async (
  summaryNavKey: SummaryParamsPromptType,
  actions: ISetActionsType,
) => {
  if (summaryNavKey === 'commit') {
    return await youTubeSummaryCommentsChangeTool(actions)
  }
  return actions
}
