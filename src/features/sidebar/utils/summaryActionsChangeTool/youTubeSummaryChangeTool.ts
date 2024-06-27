import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'

import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { IGetSummaryNavActionsParams } from '@/features/sidebar/utils/pageSummaryHelper'

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
                  favicon: `{{CURRENT_WEBPAGE_FAVICON}}`,
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
                deepDive: [],
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
        // TODO 后续优化掉这个，可以用RENDER_TEMPLATE配合SCRIPTS_CONDITIONAL实现
        type: 'YOUTUBE_GET_COMMENTS',
        parameters: {},
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
                  text: '',
                  originalMessage: {
                    status: 'complete',
                    metadata: {
                      isComplete: true,
                      deepDive: [
                        {
                          title: {
                            title: 'Deep dive',
                            titleIcon: 'TipsAndUpdates',
                          },
                          value: 'Ask AI anything about the video...',
                        },
                      ],
                    },
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
              type: 'CHAT_MESSAGE',
              parameters: {
                ActionChatMessageOperationType: 'update',
                ActionChatMessageConfig: {
                  type: 'ai',
                  messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                  text: '',
                  originalMessage: {
                    metadata: {
                      deepDive: [
                        {
                          title: {
                            title: ' ',
                            titleIcon: 'Loading',
                          },
                        },
                      ],
                    },
                  },
                } as IAIResponseMessage,
              },
            },
            {
              type: 'MAXAI_RESPONSE_RELATED',
              parameters: {
                template: `{{SUMMARY_CONTENTS}}`,
              },
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'RELATED_QUESTIONS',
              },
            },
            {
              type: 'MAXAI_SUMMARY_LOG',
              parameters: {},
            },
          ],
        },
      },
      // 下面这样写主要避免在上面的SCRIPTS_CONDITIONAL里再嵌套SCRIPTS_CONDITIONAL
      {
        type: 'RENDER_TEMPLATE',
        parameters: {
          template: '{{RELATED_QUESTIONS}}',
        },
      },
      {
        type: 'SCRIPTS_CONDITIONAL',
        parameters: {
          WFFormValues: {
            Value: '',
            WFSerializationType: 'WFDictionaryFieldValue',
          },
          WFCondition: 'Equals',
          WFConditionalIfTrueActions: [
            // 说明没有拿到related questions
            // 注意这里不要覆盖掉No comments found的情况
            {
              type: 'CHAT_MESSAGE',
              parameters: {
                ActionChatMessageOperationType: 'update',
                ActionChatMessageConfig: {
                  type: 'ai',
                  messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                  text: '',
                  originalMessage: {
                    status: 'complete',
                    metadata: {
                      isComplete: true,
                      deepDive: [
                        {
                          title: {
                            title: 'Deep dive',
                            titleIcon: 'TipsAndUpdates',
                          },
                          value: 'Ask AI anything about the video...',
                        },
                      ],
                    },
                    includeHistory: false,
                  },
                } as IAIResponseMessage,
              },
            },
          ],
          WFConditionalIfFalseActions: [
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template: `{{RELATED_QUESTIONS}}`,
              },
            },
            {
              type: 'SCRIPTS_LIST',
              parameters: {},
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
                    status: 'complete',
                    metadata: {
                      isComplete: true,
                      deepDive: [
                        {
                          title: {
                            title: 'Related',
                            titleIcon: 'Layers',
                            titleIconSize: 20,
                          },
                          type: 'related',
                          value: `{{LAST_ACTION_OUTPUT}}` as any,
                        },
                      ],
                    },
                    includeHistory: false,
                  },
                } as IAIResponseMessage,
              },
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
export const youTubeSummaryTranscriptChangeTool = async (
  actions: ISetActionsType,
  params: IGetSummaryNavActionsParams,
) => {
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
                favicon: `{{CURRENT_WEBPAGE_FAVICON}}`,
              },
              shareType: 'summary',
              title: {
                title: `Show transcript`,
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
      type: 'ANALYZE_CHAT_FILE',
      parameters: {
        AnalyzeChatFileName: 'YouTubeSummaryContent.txt',
        AnalyzeChatFileImmediateUpdateConversation: false,
      },
    },
    {
      type: 'YOUTUBE_GET_TRANSCRIPT',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'SUMMARY_TRANSCRIPTS',
      },
    },
    {
      type: 'SCRIPTS_CONDITIONAL',
      parameters: {
        WFCondition: 'Equals',
        WFFormValues: {
          Value: '[]',
          WFSerializationType: 'WFDictionaryFieldValue',
        },
        WFConditionalIfTrueActions: [
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: params.messageId || '{{AI_RESPONSE_MESSAGE_ID}}',
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
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
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
                    deepDive: [
                      {
                        type: 'transcript',
                        title: {
                          title: 'Transcript',
                          titleIcon: 'Menu',
                        },
                        value: `{{SUMMARY_TRANSCRIPTS}}`,
                      },
                      {
                        title: {
                          title: ' ',
                          titleIcon: 'Loading',
                        },
                        value: '',
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
          {
            type: 'MAXAI_RESPONSE_RELATED',
            parameters: {
              template: `{{SUMMARY_TRANSCRIPTS}}`,
            },
          },
          {
            type: 'SET_VARIABLE',
            parameters: {
              VariableName: 'RELATED_QUESTIONS',
            },
          },
        ],
      },
    },
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{RELATED_QUESTIONS}}',
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
          // 没有related question
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                text: '',
                originalMessage: {
                  status: 'complete',
                  content: undefined,
                  metadata: {
                    isComplete: true,
                    deepDive: [
                      {
                        type: 'transcript',
                        title: {
                          title: 'Transcript',
                          titleIcon: 'Menu',
                        },
                        value: `{{SUMMARY_TRANSCRIPTS}}`,
                      },
                      {
                        title: {
                          title: 'Deep dive',
                          titleIcon: 'TipsAndUpdates',
                        },
                        value: 'Ask AI anything about the video...',
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有related question
          {
            type: 'RENDER_TEMPLATE',
            parameters: {
              template: `{{RELATED_QUESTIONS}}`,
            },
          },
          {
            type: 'SCRIPTS_LIST',
            parameters: {},
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
                  status: 'complete',
                  content: undefined,
                  metadata: {
                    isComplete: true,
                    deepDive: [
                      {
                        type: 'transcript',
                        title: {
                          title: 'Transcript',
                          titleIcon: 'Menu',
                        },
                        value: `{{SUMMARY_TRANSCRIPTS}}`,
                      },
                      {
                        title: {
                          title: 'Related',
                          titleIcon: 'Layers',
                        },
                        type: 'related',
                        value: '{{LAST_ACTION_OUTPUT}}' as any,
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
      },
    },
  ]
  return cloneDeep(newActions)
}
export const youTubeSummaryTranscriptTimestampedChangeTool = async (
  actions: ISetActionsType,
  params: IGetSummaryNavActionsParams,
) => {
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
                favicon: `{{CURRENT_WEBPAGE_FAVICON}}`,
              },
              shareType: 'summary',
              title: {
                title: `Show transcript`,
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
      type: 'ANALYZE_CHAT_FILE',
      parameters: {
        AnalyzeChatFileName: 'YouTubeSummaryContent.txt',
        AnalyzeChatFileImmediateUpdateConversation: false,
      },
    },
    {
      type: 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'TRANSCRIPT_TIMESTAMPED',
      },
    },
    {
      type: 'SCRIPTS_CONDITIONAL',
      parameters: {
        WFCondition: 'Equals',
        WFFormValues: {
          // 空数组代表没有TRANSCRIPT_TIMESTAMPED
          Value: '[]',
          WFSerializationType: 'WFDictionaryFieldValue',
        },
        WFConditionalIfTrueActions: [
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: params.messageId || '{{AI_RESPONSE_MESSAGE_ID}}',
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
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
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
                    deepDive: [
                      {
                        type: 'timestampedSummary',
                        title: {
                          title: 'Summary',
                          titleIcon: 'SummaryInfo',
                        },
                        value: `{{TRANSCRIPT_TIMESTAMPED}}`,
                      },
                      {
                        title: {
                          title: ' ',
                          titleIcon: 'Loading',
                        },
                        value: '',
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
          {
            type: 'MAXAI_RESPONSE_RELATED',
            parameters: {
              template: `{{TRANSCRIPT_TIMESTAMPED}}`,
            },
          },
          {
            type: 'SET_VARIABLE',
            parameters: {
              VariableName: 'RELATED_QUESTIONS',
            },
          },
        ],
      },
    },
    // 下面这样写主要避免在上面的SCRIPTS_CONDITIONAL里再嵌套SCRIPTS_CONDITIONAL
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{RELATED_QUESTIONS}}',
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
          // 没有related question
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: params.messageId || `{{AI_RESPONSE_MESSAGE_ID}}`,
                text: '',
                originalMessage: {
                  status: 'complete',
                  content: undefined,
                  metadata: {
                    isComplete: true,
                    deepDive: [
                      {
                        type: 'timestampedSummary',
                        title: {
                          title: 'Summary',
                          titleIcon: 'SummaryInfo',
                        },
                        value: `{{TRANSCRIPT_TIMESTAMPED}}`,
                      },
                      {
                        title: {
                          title: 'Deep dive',
                          titleIcon: 'TipsAndUpdates',
                        },
                        value: 'Ask AI anything about the video...',
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有related question
          {
            type: 'RENDER_TEMPLATE',
            parameters: {
              template: `{{RELATED_QUESTIONS}}`,
            },
          },
          {
            type: 'SCRIPTS_LIST',
            parameters: {},
          },
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: params.messageId || '{{AI_RESPONSE_MESSAGE_ID}}',
                text: '',
                originalMessage: {
                  status: 'complete',
                  content: undefined,
                  metadata: {
                    isComplete: true,
                    deepDive: [
                      {
                        type: 'timestampedSummary',
                        title: {
                          title: 'Summary',
                          titleIcon: 'SummaryInfo',
                        },
                        value: `{{TRANSCRIPT_TIMESTAMPED}}`,
                      },
                      {
                        title: {
                          title: 'Related',
                          titleIcon: 'Layers',
                          titleIconSize: 20,
                        },
                        type: 'related',
                        value: `{{LAST_ACTION_OUTPUT}}` as any,
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
      },
    },
  ]
  return cloneDeep(newActions)
}
export const youTubeSummaryChangeTool = async (
  params: IGetSummaryNavActionsParams,
  actions: ISetActionsType,
) => {
  if (params.key === 'comment') {
    return await youTubeSummaryCommentsChangeTool(actions, params)
  } else if (params.key === 'transcript') {
    return await youTubeSummaryTranscriptChangeTool(actions, params)
  } else if (params.key === 'timestamped') {
    return await youTubeSummaryTranscriptTimestampedChangeTool(actions, params)
  }
  return cloneDeep(actions)
}
