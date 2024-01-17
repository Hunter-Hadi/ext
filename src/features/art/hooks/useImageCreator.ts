import { v4 as uuidV4 } from 'uuid'

import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

const useImageCreator = () => {
  const { askAIWIthShortcuts } = useClientChat()
  const startTextToImage = async (text: string, needTransfer: boolean) => {
    const messageId = uuidV4()
    const actions: ISetActionsType = [
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
                  title: 'Image creator',
                },
                copilot: {
                  title: {
                    title: 'Creator',
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
              messageVisibleText: text,
              contextMenu: {
                id: '816e3fe0-bd04-418e-8f6e-d33d8c4dba67',
                droppable: false,
                parent: '',
                text: '[Art] smart prompt',
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
    await askAIWIthShortcuts(actions)
  }
  return {
    startTextToImage,
  }
}
export default useImageCreator
