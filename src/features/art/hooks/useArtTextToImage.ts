import { v4 as uuidV4 } from 'uuid'

import { getAIProviderSettings } from '@/background/src/chat/util'
import {
  ART__DALLE3_PROMPT_OPTIMIZATION__PROMPT_ID,
  ART__TEXT_TO_IMAGE__PROMPT_ID,
} from '@/constants'
import { ART_NATURAL_LANGUAGE_TO_DALL_E_3_PROMPT } from '@/features/art/constant'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage, IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'

const useArtTextToImage = () => {
  const { askAIWIthShortcuts } = useClientChat()
  const {
    pushPricingHookMessage,
    currentSidebarConversationType,
    currentConversationId,
    createConversation,
    getConversation,
  } = useClientConversation()
  const {
    sidebarSettings,
    updateSidebarConversationType,
    currentSidebarConversationMessages,
  } = useSidebarSettings()
  const { isPayingUser } = useUserInfo()
  const startTextToImage = async (text: string) => {
    if (!isShowChatBox()) {
      showChatBox()
    }
    if (currentSidebarConversationType !== 'Art') {
      await updateSidebarConversationType('Art')
    }
    if (
      currentConversationId &&
      (await getConversation(currentConversationId))
    ) {
      // conversation存在
    } else {
      // conversation不存在
      await createConversation('Art')
    }
    // 只要是付费用户就不卡
    if (!isPayingUser) {
      await pushPricingHookMessage('MAXAI_IMAGE_GENERATE_MODEL')
      authEmitPricingHooksLog('show', `MAXAI_IMAGE_GENERATE_MODEL`, {
        conversationId: currentConversationId,
      })
      return
    }
    const messageId = uuidV4()
    const modelConfig = await getAIProviderSettings('MAXAI_DALLE')
    const isNeedTransform =
      sidebarSettings?.art?.isEnabledConversationalMode === true
    let actions: ISetActionsType = []
    // 需要智能生成
    if (isNeedTransform) {
      // 为了让用户可以连续对话，这里合成前面的问题
      const historyMessages: IChatMessage[] = [
        {
          type: 'system',
          text: ART_NATURAL_LANGUAGE_TO_DALL_E_3_PROMPT,
          messageId: uuidV4(),
        },
      ]
      // 倒序合成
      for (let i = currentSidebarConversationMessages.length - 1; i >= 0; i--) {
        const message = currentSidebarConversationMessages[i]
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
          // 因为是从这条消息开始includeHistory为false，所以合成这条消息后,跳出循环
          if (message.originalMessage.metadata?.includeHistory === false) {
            break
          }
        }
      }
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
                      title: 'AI art',
                      titleIcon: 'Awesome',
                      titleIconSize: 24,
                    },
                    steps: [
                      {
                        title: 'Optimizing art prompt',
                        status: 'loading',
                        icon: 'CheckCircle',
                      },
                    ],
                  },
                  artTextToImageMetadata: modelConfig,
                },
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
            isEnabledDetectAIResponseLanguage: false,
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
            AskChatGPTActionQuestion: {
              text: text,
              meta: {
                historyMessages,
                messageVisibleText: text,
                contextMenu: {
                  id: ART__DALLE3_PROMPT_OPTIMIZATION__PROMPT_ID,
                  droppable: false,
                  parent: '',
                  text: '[Art] dalle3 prompt optimization',
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
                        title: 'Optimizing art prompt',
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
                    title: 'Image',
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
            isEnabledDetectAIResponseLanguage: false,
            AskChatGPTActionQuestion: {
              text: `{{IMAGE_PROMPT}}`,
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                messageVisibleText: `{{IMAGE_PROMPT}}`,
                contextMenu: {
                  id: ART__TEXT_TO_IMAGE__PROMPT_ID,
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
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              text: '',
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              originalMessage: {
                content: {
                  text: '',
                  contentType: 'image',
                },
                metadata: {
                  attachments: `{{LAST_ACTION_OUTPUT}}` as any,
                },
              },
            } as IAIResponseMessage,
          },
        },
      ]
    } else {
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
                  includeHistory: false,
                  artTextToImagePrompt: text,
                  shareType: 'art',
                  title: {
                    title: text,
                  },
                  copilot: {
                    title: {
                      title: 'AI art',
                      titleIcon: 'Awesome',
                      titleIconSize: 24,
                    },
                    steps: [
                      {
                        title: 'Art prompt',
                        status: 'complete',
                        icon: 'CheckCircle',
                        value: text,
                      },
                    ],
                  },
                  artTextToImageMetadata: modelConfig,
                },
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
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              text: '',
              originalMessage: {
                content: {
                  title: {
                    title: 'Image',
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
            isEnabledDetectAIResponseLanguage: false,
            AskChatGPTActionQuestion: {
              text: text,
              meta: {
                includeHistory: false,
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                messageVisibleText: text,
                contextMenu: {
                  id: ART__TEXT_TO_IMAGE__PROMPT_ID,
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
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              text: '',
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              originalMessage: {
                content: {
                  text: '',
                  contentType: 'image',
                },
                metadata: {
                  attachments: `{{LAST_ACTION_OUTPUT}}` as any,
                },
              },
            } as IAIResponseMessage,
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
