import { v4 as uuidV4 } from 'uuid'

import {
  VARIABLE_AI_RESPONSE_LANGUAGE,
  VARIABLE_CURRENT_WEBPAGE_URL,
  VARIABLE_CURRENT_WEBSITE_DOMAIN,
} from '@/background/defaultPromptsData/systemVariables'
import {
  SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
  SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
  SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
} from '@/constants'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type YOUTUBE_SUMMARY_NAV_TYPES =
  | 'all'
  | 'timestamped'
  | 'comment'
  | 'transcript'

export const YOUTUBE_SUMMARY_ACTIONS_MAP: {
  [key in YOUTUBE_SUMMARY_NAV_TYPES]: (messageId?: string) => ISetActionsType
} = {
  all: (messageId) => [
    {
      type: 'CHAT_MESSAGE',
      parameters: {
        ActionChatMessageOperationType: 'add',
        ActionChatMessageConfig: {
          type: 'ai',
          messageId: messageId || uuidV4(),
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
      type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'YOUTUBE_TRANSCRIPTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '',
          docType: 'youtube',
          doneType: 'document_create',
          file: {
            description: '{{SOCIAL_MEDIA_POST_CONTENT}}',
            author: '{{SOCIAL_MEDIA_POST_AUTHOR}}',
            date: '{{SOCIAL_MEDIA_POST_DATE}}',
            title: '{{SOCIAL_MEDIA_POST_TITLE}}',
            comments: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
            transcripts: '{{YOUTUBE_TRANSCRIPTS}}',
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
          messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                titleIcon: 'Loading',
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
      type: 'ASK_CHATGPT',
      parameters: {
        MaxAIPromptActionConfig: {
          promptId: SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
          promptName: '[Summary] Summarize video',
          promptActionType: 'chat_complete',
          variables: [
            VARIABLE_CURRENT_WEBPAGE_URL,
            VARIABLE_CURRENT_WEBSITE_DOMAIN,
            VARIABLE_AI_RESPONSE_LANGUAGE,
          ],
          output: [],
        },
        AskChatGPTActionQuestion: {
          text: '',
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: {
              id: SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize video',
              data: {
                editable: false,
                type: 'shortcuts',
              },
            },
          },
        },
        AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
        AskChatGPTActionOutput: 'message',
      },
    },
    {
      type: 'SCRIPTS_DICTIONARY',
      parameters: {},
    },
    {
      type: 'SCRIPTS_GET_DICTIONARY_VALUE',
      parameters: {
        ActionGetDictionaryKey: 'value',
        ActionGetDictionaryValue: 'originalMessage.metadata.deepDive[0]',
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
        WFConditionalIfFalseActions: [],
      },
    },
    // {
    //   type: 'CREATE_WEBSITE_CONTEXT',
    //   parameters: {
    //     CreateWebsiteContextConfig: {
    //       summary: '{{SUMMARY_CONTENTS}}',
    //       meta: {
    //         readability: '{{READABILITY_CONTENTS}}',
    //       },
    //     },
    //   },
    // },
  ],
  timestamped: (messageId) => [
    {
      type: 'CHAT_MESSAGE',
      parameters: {
        ActionChatMessageOperationType: 'add',
        ActionChatMessageConfig: {
          type: 'ai',
          messageId: messageId || uuidV4(),
          text: '',
          originalMessage: {
            content: {
              title: {
                title: 'noneShowContent',
              },
              text: '',
              contentType: 'text',
            },
            metadata: {
              sourceWebpage: {
                url: `{{CURRENT_WEBPAGE_URL}}`,
                title: `{{CURRENT_WEBPAGE_TITLE}}`,
                favicon: `{{CURRENT_WEBPAGE_FAVICON}}`,
              },
              shareType: 'summary',
              title: {
                title: `Timestamped summary`,
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
      type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'YOUTUBE_TRANSCRIPTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '',
          docType: 'youtube',
          doneType: 'document_create',
          file: {
            description: '{{SOCIAL_MEDIA_POST_CONTENT}}',
            author: '{{SOCIAL_MEDIA_POST_AUTHOR}}',
            date: '{{SOCIAL_MEDIA_POST_DATE}}',
            title: '{{SOCIAL_MEDIA_POST_TITLE}}',
            comments: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
            transcripts: '{{YOUTUBE_TRANSCRIPTS}}',
          },
        },
      },
    },
    // {
    //   type: 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED',
    //   parameters: {},
    // },
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{YOUTUBE_TRANSCRIPTS}}',
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
          // 没有YOUTUBE_TRANSCRIPTS
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
                    isComplete: true,
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
                      // {
                      //   title: {
                      //     title: 'Oops！We Can‘t Read the video',
                      //     titleIcon: 'TipsAndUpdates',
                      //   },
                      //   value:
                      //     'Unfortunately, subtitles are unavailable for 12% of the videos. We are unable to create summaries for them at this time. Please, try another video instead 😌',
                      // },
                      // 组件里会去显示无内容信息
                      {
                        type: 'timestampedSummary',
                        title: {
                          title: 'Summary',
                          titleIcon: 'SummaryInfo',
                        },
                        value: [],
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
              AskChatGPTActionOutput: 'message',
            },
          },
          {
            type: 'RENDER_TEMPLATE',
            parameters: {
              template: 'YOUTUBE_TRANSCRIPTS_NONE',
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有YOUTUBE_TRANSCRIPTS
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                        value: [
                          {
                            id: uuidV4(),
                            start: '',
                            duration: '',
                            text: '',
                            status: 'loading',
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
          {
            type: 'ASK_CHATGPT',
            parameters: {
              MaxAIPromptActionConfig: {
                promptId: SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
                promptName: '[Summary] Timestamped summary',
                promptActionType: 'chat_complete',
                variables: [
                  VARIABLE_CURRENT_WEBPAGE_URL,
                  VARIABLE_CURRENT_WEBSITE_DOMAIN,
                  VARIABLE_AI_RESPONSE_LANGUAGE,
                ],
                output: [],
              },
              AskChatGPTActionQuestion: {
                text: '',
                meta: {
                  outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                  contextMenu: {
                    id: SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
                    parent: 'root',
                    droppable: false,
                    text: '[Summary] Timestamped summary',
                    data: {
                      editable: false,
                      type: 'shortcuts',
                    },
                  },
                },
              },
              AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
              AskChatGPTActionOutput: 'message',
            },
          },
          {
            type: 'SCRIPTS_DICTIONARY',
            parameters: {},
          },
          {
            type: 'SCRIPTS_GET_DICTIONARY_VALUE',
            parameters: {
              ActionGetDictionaryKey: 'value',
              ActionGetDictionaryValue:
                'originalMessage.metadata.deepDive[1].value',
            },
          },
        ],
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
          // 没有related question但是有TRANSCRIPT_TIMESTAMPED
          {
            type: 'SCRIPTS_GET_DICTIONARY_VALUE',
            parameters: {
              ActionGetDictionaryKey: 'value',
              ActionGetDictionaryValue:
                'originalMessage.metadata.deepDive[0].value',
            },
          },
          {
            type: 'SET_VARIABLE',
            parameters: {
              VariableName: 'TRANSCRIPT_TIMESTAMPED',
            },
          },
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        ],
      },
    },
  ],
  comment: (messageId) => [
    {
      type: 'CHAT_MESSAGE',
      parameters: {
        ActionChatMessageOperationType: 'add',
        ActionChatMessageConfig: {
          type: 'ai',
          messageId: messageId || uuidV4(),
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
                title: `Summarize comments`,
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
      type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'YOUTUBE_TRANSCRIPTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '',
          docType: 'youtube',
          doneType: 'document_create',
          file: {
            description: '{{SOCIAL_MEDIA_POST_CONTENT}}',
            author: '{{SOCIAL_MEDIA_POST_AUTHOR}}',
            date: '{{SOCIAL_MEDIA_POST_DATE}}',
            title: '{{SOCIAL_MEDIA_POST_TITLE}}',
            comments: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
            transcripts: '{{YOUTUBE_TRANSCRIPTS}}',
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
          messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                titleIcon: 'Loading',
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
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
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
          // 没有评论
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                      titleIcon: '',
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
          // 有评论
          {
            type: 'ASK_CHATGPT',
            parameters: {
              MaxAIPromptActionConfig: {
                promptId: SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
                promptName: '[Summary] Summarize comments',
                promptActionType: 'chat_complete',
                variables: [
                  VARIABLE_CURRENT_WEBPAGE_URL,
                  VARIABLE_CURRENT_WEBSITE_DOMAIN,
                  VARIABLE_AI_RESPONSE_LANGUAGE,
                ],
                output: [],
              },
              AskChatGPTActionQuestion: {
                text: '',
                meta: {
                  outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                  contextMenu: {
                    id: SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
                    parent: 'root',
                    droppable: false,
                    text: '[Summary] Summarize comments',
                    data: {
                      editable: false,
                      type: 'shortcuts',
                    },
                  },
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
        ],
      },
    },
    // 下面这样写主要避免在上面的SCRIPTS_CONDITIONAL里再嵌套
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{SUMMARY_CONTENTS}}',
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
          // 说明没有拿到ai response和related questions
          // 注意这里不要覆盖掉No comments found的情况
          {
            type: 'CHAT_MESSAGE',
            parameters: {
              ActionChatMessageOperationType: 'update',
              ActionChatMessageConfig: {
                type: 'ai',
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        WFConditionalIfFalseActions: [],
      },
    },
  ],
  transcript: (messageId) => [
    {
      type: 'CHAT_MESSAGE',
      parameters: {
        ActionChatMessageOperationType: 'add',
        ActionChatMessageConfig: {
          type: 'ai',
          messageId: messageId || uuidV4(),
          text: '',
          originalMessage: {
            content: {
              title: {
                title: 'noneShowContent',
              },
              text: '',
              contentType: 'text',
            },
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
      type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'YOUTUBE_TRANSCRIPTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '',
          docType: 'youtube',
          doneType: 'document_create',
          file: {
            description: '{{SOCIAL_MEDIA_POST_CONTENT}}',
            author: '{{SOCIAL_MEDIA_POST_AUTHOR}}',
            date: '{{SOCIAL_MEDIA_POST_DATE}}',
            title: '{{SOCIAL_MEDIA_POST_TITLE}}',
            comments: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
            transcripts: '{{YOUTUBE_TRANSCRIPTS}}',
          },
        },
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
                messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
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
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
  ],
}
