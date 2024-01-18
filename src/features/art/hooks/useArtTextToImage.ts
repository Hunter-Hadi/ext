import { v4 as uuidV4 } from 'uuid'

import { getThirdProviderSettings } from '@/background/src/chat/util'
import { ART_NATURAL_LANGUAGE_TO_DALL_E_3_PROMPT } from '@/features/art/constant'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const useArtTextToImage = () => {
  const { askAIWIthShortcuts } = useClientChat()
  const {
    sidebarSettings,
    currentSidebarConversationMessages,
  } = useSidebarSettings()
  const startTextToImage = async (text: string) => {
    const messageId = uuidV4()
    const modelConfig = await getThirdProviderSettings('MAXAI_ART')
    const isNeedTransform =
      sidebarSettings?.art?.isEnabledConversationalMode === true
    let actions: ISetActionsType = []
    if (isNeedTransform) {
      // 为了让用户可以连续对话，这里合成前面的问题
      const historyMessages: IChatMessage[] = [
        {
          type: 'system',
          text: ART_NATURAL_LANGUAGE_TO_DALL_E_3_PROMPT,
          messageId: uuidV4(),
        },
      ]
      currentSidebarConversationMessages.map((message) => {
        if (isAIMessage(message) && message.originalMessage) {
          const question = message.originalMessage.metadata?.title?.title || ''
          const answer =
            message.originalMessage.metadata?.artTextToImagePrompt || ''
          if (question && answer) {
            // 因为要把一条信息拆成2条，所以需要调整一下messageId和parentMessageId
            const userMessageId = uuidV4()
            historyMessages.push({
              type: 'user',
              messageId: userMessageId,
              parentMessageId: message.parentMessageId,
              text: question,
            })
            historyMessages.push({
              type: 'ai',
              messageId: message.messageId,
              parentMessageId: userMessageId,
              text: answer,
            })
          }
        }
      })
      actions = [
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'add',
            ActionChatMessageConfig: {
              type: 'ai',
              messageId,
              text: '',
              originalMessage: {
                metadata: {
                  shareType: 'art',
                  title: {
                    title: text,
                  },
                  copilot: {
                    title: {
                      title: 'Copilot',
                      titleIcon: 'Awesome',
                      titleIconSize: 24,
                    },
                    steps: [
                      {
                        title: 'Understanding question',
                        status: 'loading',
                        icon: 'CheckCircle',
                      },
                    ],
                  },
                  artTextToImageMetadata: modelConfig,
                },
                includeHistory: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'AI_RESPONSE_MESSAGE_ID',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
            AskChatGPTActionQuestion: {
              text: text,
              meta: {
                historyMessages,
                messageVisibleText: text,
                contextMenu: {
                  id: '816e3fe0-bd04-418e-8f6e-d33d8c4dba67',
                  droppable: false,
                  parent: '',
                  text: '[Art] natural language to DALL·E 3 prompt',
                  data: {
                    editable: false,
                    type: 'shortcuts',
                    actions: [],
                  },
                } as IContextMenuItem,
              },
            },
          },
        },
        {
          type: 'TEXT_HANDLER',
          parameters: {
            ActionTextHandleParameters: {
              trim: true,
              noQuotes: true,
              noCommand: true,
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'IMAGE_PROMPT',
          },
        },
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              text: '',
              originalMessage: {
                metadata: {
                  copilot: {
                    steps: [
                      {
                        title: 'Understanding question',
                        status: 'complete',
                        icon: 'CheckCircle',
                        value: `{{IMAGE_PROMPT}}`,
                        valueType: 'text',
                      },
                    ],
                  },
                  artTextToImagePrompt: `{{IMAGE_PROMPT}}`,
                },
                content: {
                  title: {
                    title: 'AI art',
                    titleIcon: 'Image',
                  },
                  contentType: 'image',
                  text: '',
                },
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
            AskChatGPTActionQuestion: {
              text: `{{IMAGE_PROMPT}}`,
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                messageVisibleText: `{{IMAGE_PROMPT}}`,
                contextMenu: {
                  id: 'f19e862d-e8bb-4b09-9220-6a9a395deb6f',
                  droppable: false,
                  parent: '',
                  text: '[Art] text to image',
                  data: {
                    editable: false,
                    type: 'shortcuts',
                    actions: [],
                  },
                } as IContextMenuItem,
              },
            },
          },
        },
      ]
    }
    await askAIWIthShortcuts(actions)
  }
  return {
    startTextToImage,
  }
}
export default useArtTextToImage
