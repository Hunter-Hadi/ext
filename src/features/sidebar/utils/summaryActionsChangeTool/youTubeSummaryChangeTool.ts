import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

import { IGetSummaryNavActionsParams } from '../pageSummaryHelper'

export const youTubeSummaryCommentsChangeTool = async (
  actions: ISetActionsType,
  params: IGetSummaryNavActionsParams,
) => {
  try {
    const newActions: ISetActionsType = [
      {
        type: 'CHAT_MESSAGE',
        parameters: {
          ActionChatMessageOperationType: 'add',
          ActionChatMessageConfig: {
            type: 'ai',
            messageId: uuidV4(),
            text: '',
            originalMessage: {
              metadata: {
                sourceWebpage: {
                  url: `{{CURRENT_WEBPAGE_URL}}`,
                  title: `{{CURRENT_WEBPAGE_TITLE}}`,
                },
                shareType: 'summary',
                title: {
                  title: `Summarize video`,
                },
                copilot: {
                  title: {
                    title: 'Page insights',
                    titleIcon: 'LaptopMac',
                  },
                  steps: [
                    {
                      title: 'Analyzing video',
                      status: 'loading',
                      icon: 'SmartToy',
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
        type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
        parameters: {
          OperationElementSelector: 'ytd-watch-metadata #title',
        },
      },
      {
        type: 'SET_VARIABLE',
        parameters: {
          VariableName: 'READABILITY_CONTENTS',
        },
      },
      {
        type: 'ANALYZE_CHAT_FILE',
        parameters: {
          AnalyzeChatFileName: 'YouTubeSummaryContent.txt',
          AnalyzeChatFileImmediateUpdateConversation: false,
        },
      },
      {
        type: 'CHAT_MESSAGE',
        parameters: {
          ActionChatMessageOperationType: 'update',
          ActionChatMessageConfig: {
            type: 'ai',
            messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
            text: '',
            originalMessage: {
              metadata: {
                copilot: {
                  steps: [
                    {
                      title: 'Analyzing video',
                      status: 'complete',
                      icon: 'SmartToy',
                      value: '{{CURRENT_WEBPAGE_TITLE}}',
                    },
                  ],
                },
              },
              content: {
                title: {
                  title: 'Summary',
                },
                text: '',
                contentType: 'text',
              },
              includeHistory: false,
            },
          } as IAIResponseMessage,
        },
      },
      {
        type: 'YOUTUBE_GET_COMMENTS',
        parameters: {},
      },
      {
        type: 'SET_VARIABLE',
        parameters: {
          VariableName: 'YOUTUBE_COMMENT',
        },
      },
      {
        type: 'SCRIPTS_CONDITIONAL',
        parameters: {
          WFCondition: 'Equals',
          WFFormValues: {
            Value: '',
            WFSerializationType: 'WFDictionaryFieldValue',
          },
          WFConditionalIfTrueActions: [
            {
              type: 'CHAT_MESSAGE',
              parameters: {
                ActionChatMessageOperationType: 'update',
                ActionChatMessageConfig: {
                  type: 'ai',
                  messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                  text: `{{LAST_ACTION_OUTPUT}`,
                  originalMessage: {
                    status: 'complete',
                    metadata: {
                      isComplete: true,
                      deepDive: {
                        title: {
                          title: 'Deep dive',
                          titleIcon: 'TipsAndUpdates',
                        },
                        value: 'Ask AI anything about the video...',
                      },
                    },
                    content: {
                      text: `{{LAST_ACTION_OUTPUT}}`,
                      title: {
                        title: 'Summary',
                      },
                      contentType: 'text',
                    },
                    includeHistory: false,
                  },
                } as IAIResponseMessage,
              },
            },
            {
              type: 'CHAT_MESSAGE',
              parameters: {
                ActionChatMessageOperationType: 'update',
                ActionChatMessageConfig: {
                  type: 'ai',
                  messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
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
            },
          ],
          WFConditionalIfFalseActions: [
            {
              type: 'ASK_CHATGPT',
              parameters: {
                AskChatGPTActionQuestion: {
                  text: params.prompt,
                  meta: {
                    outputMessageId:
                      params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                  },
                },
                AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
              },
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'SUMMARY_CONTENTS',
              },
            },
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template: `#### Top Comment
_TL;DR_ **{{SUMMARY_CONTENTS}}**
       
{{YOUTUBE_COMMENT}}
                    `,
              },
            },
            {
              type: 'CHAT_MESSAGE',
              parameters: {
                ActionChatMessageOperationType: 'update',
                ActionChatMessageConfig: {
                  type: 'ai',
                  messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                  text: `{{LAST_ACTION_OUTPUT}`,
                  originalMessage: {
                    status: 'complete',
                    metadata: {
                      isComplete: true,
                      deepDive: {
                        title: {
                          title: 'Deep dive',
                          titleIcon: 'TipsAndUpdates',
                        },
                        value: 'Ask AI anything about the video...',
                      },
                    },
                    content: {
                      text: `{{LAST_ACTION_OUTPUT}}`,
                      title: {
                        title: 'Summary',
                      },
                      contentType: 'text',
                    },
                    includeHistory: false,
                  },
                } as IAIResponseMessage,
              },
            },
            {
              type: 'MAXAI_SUMMARY_LOG',
              parameters: {},
            },
          ],
        },
      },
    ]
    return cloneDeep(newActions)
  } catch (e) {
    return cloneDeep(actions)
  }
}
export const youTubeSummaryChangeTool = async (
  params: IGetSummaryNavActionsParams,
  actions: ISetActionsType,
) => {
  if (params.key === 'commit') {
    return await youTubeSummaryCommentsChangeTool(actions, params)
  }
  return cloneDeep(actions)
}
