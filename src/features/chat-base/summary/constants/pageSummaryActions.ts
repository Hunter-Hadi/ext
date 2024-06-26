import { v4 as uuidV4 } from 'uuid'

import { VARIABLE_CURRENT_WEBPAGE_URL } from '@/background/defaultPromptsData/systemVariables'
import {
  SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
} from '@/constants'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type PAGE_SUMMARY_NAV_TYPES = 'all' | 'summary' | 'keyTakeaways'

export const PAGE_SUMMARY_CONTEXT_MENU_MAP: {
  [key in PAGE_SUMMARY_NAV_TYPES]: () => ISetActionsType
} = {
  all: () => [
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
                title: `Summarize page`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing page',
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
      type: 'GET_READABILITY_CONTENTS_OF_WEBPAGE',
      parameters: {},
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
        AnalyzeChatFileImmediateUpdateConversation: false,
        AnalyzeChatFileName: 'PageSummaryContent.txt',
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
                    title: 'Analyzing page',
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
      type: 'ASK_CHATGPT',
      parameters: {
        // TODO 修改配置
        MaxAIPromptActionConfig: {
          promptId: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
          promptName: `[Summary] Summarize page`,
          promptActionType: 'chat_complete',
          variables: [
            {
              VariableName: 'PAGE_CONTENT',
              label: 'PAGE_CONTENT',
              defaultValue: '{{READABILITY_CONTENTS}}',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
            VARIABLE_CURRENT_WEBPAGE_URL,
          ],
          output: [
            {
              label: 'Summary content',
              VariableName: 'SUMMARY_CONTENTS',
              valueType: 'Text',
              systemVariable: true,
            },
          ],
        },
        AskChatGPTActionQuestion: {
          text: '',
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: {
              id: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize page',
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
    // TODO 如果没有related questions
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                        titleIconSize: 20,
                      },
                      value: 'Ask AI anything about the page...',
                    },
                  },
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
                    deepDive: {
                      title: {
                        title: 'Related',
                        titleIcon: 'Layers',
                        titleIconSize: 20,
                      },
                      type: 'related',
                      value: `{{LAST_ACTION_OUTPUT}}` as any,
                    },
                  },
                },
              } as IAIResponseMessage,
            },
          },
        ],
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
  summary: () => [
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
                title: `Summarize page (TL:DR)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing page',
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
      type: 'GET_READABILITY_CONTENTS_OF_WEBPAGE',
      parameters: {},
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
        AnalyzeChatFileImmediateUpdateConversation: false,
        AnalyzeChatFileName: 'PageSummaryContent.txt',
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
                    title: 'Analyzing page',
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
      type: 'ASK_CHATGPT',
      parameters: {
        // TODO 修改配置
        MaxAIPromptActionConfig: {
          promptId: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
          promptName: `[Summary] Summarize page`,
          promptActionType: 'chat_complete',
          variables: [
            {
              VariableName: 'PAGE_CONTENT',
              label: 'PAGE_CONTENT',
              defaultValue: '{{READABILITY_CONTENTS}}',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
            VARIABLE_CURRENT_WEBPAGE_URL,
          ],
          output: [
            {
              label: 'Summary content',
              VariableName: 'SUMMARY_CONTENTS',
              valueType: 'Text',
              systemVariable: true,
            },
          ],
        },
        AskChatGPTActionQuestion: {
          text: '',
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: {
              id: SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize page (TL:DR)',
              data: {
                editable: false,
                type: 'shortcuts',
                actions: [],
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
    // TODO 如果没有related questions
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                        titleIconSize: 20,
                      },
                      value: 'Ask AI anything about the page...',
                    },
                  },
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
                    deepDive: {
                      title: {
                        title: 'Related',
                        titleIcon: 'Layers',
                        titleIconSize: 20,
                      },
                      type: 'related',
                      value: `{{LAST_ACTION_OUTPUT}}` as any,
                    },
                  },
                },
              } as IAIResponseMessage,
            },
          },
        ],
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
  keyTakeaways: () => [
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
                title: `Summarize page`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing page',
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
      type: 'GET_READABILITY_CONTENTS_OF_WEBPAGE',
      parameters: {},
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
        AnalyzeChatFileImmediateUpdateConversation: false,
        AnalyzeChatFileName: 'PageSummaryContent.txt',
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
                    title: 'Analyzing page',
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
      type: 'ASK_CHATGPT',
      parameters: {
        // TODO 修改配置
        MaxAIPromptActionConfig: {
          promptId: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
          promptName: `[Summary] Summarize page`,
          promptActionType: 'chat_complete',
          variables: [
            {
              VariableName: 'PAGE_CONTENT',
              label: 'PAGE_CONTENT',
              defaultValue: '{{READABILITY_CONTENTS}}',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
            VARIABLE_CURRENT_WEBPAGE_URL,
          ],
          output: [
            {
              label: 'Summary content',
              VariableName: 'SUMMARY_CONTENTS',
              valueType: 'Text',
              systemVariable: true,
            },
          ],
        },
        AskChatGPTActionQuestion: {
          text: '',
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: {
              id: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize page',
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
    // TODO 如果没有related questions
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                        titleIconSize: 20,
                      },
                      value: 'Ask AI anything about the page...',
                    },
                  },
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
                    deepDive: {
                      title: {
                        title: 'Related',
                        titleIcon: 'Layers',
                        titleIconSize: 20,
                      },
                      type: 'related',
                      value: `{{LAST_ACTION_OUTPUT}}` as any,
                    },
                  },
                },
              } as IAIResponseMessage,
            },
          },
        ],
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
}
