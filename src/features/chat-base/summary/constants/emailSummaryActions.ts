import { v4 as uuidV4 } from 'uuid'

import {
  VARIABLE_AI_RESPONSE_LANGUAGE,
  VARIABLE_CURRENT_WEBPAGE_URL,
  VARIABLE_CURRENT_WEBSITE_DOMAIN,
} from '@/background/defaultPromptsData/systemVariables'
import {
  SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
} from '@/constants'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type EMAIL_SUMMARY_NAV_TYPES =
  | 'all'
  | 'summary'
  | 'keyTakeaways'
  | 'actions'

export const EMAIL_SUMMARY_ACTIONS_MAP: {
  [key in EMAIL_SUMMARY_NAV_TYPES]: (messageId?: string) => ISetActionsType
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
                title: `Summarize email`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing email',
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
      type: 'SET_VARIABLE',
      parameters: {
        Variable: {
          key: 'AUTO_LANGUAGE_NAME',
          value: 'auto',
          isBuiltIn: true,
          overwrite: true,
        },
      },
    },
    {
      type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '{{READABILITY_CONTENTS}}',
          docType: 'page_content__email',
          doneType: 'document_create',
          file: {
            readabilityMarkdown: '{{READABILITY_CONTENTS}}',
          },
        },
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'DOC_ID',
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
                    title: 'Analyzing email',
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
          promptId: SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
          promptName: '[Summary] Summarize email',
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
              id: SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize email',
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
        ActionGetDictionaryValue: 'originalMessage.metadata.deepDive.value',
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value: 'Ask AI anything about the email...',
                    },
                  },
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
  summary: (messageId) => [
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
                title: `Summarize email (TL;DR)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing email',
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
      type: 'SET_VARIABLE',
      parameters: {
        Variable: {
          key: 'AUTO_LANGUAGE_NAME',
          value: 'auto',
          isBuiltIn: true,
          overwrite: true,
        },
      },
    },
    {
      type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '{{READABILITY_CONTENTS}}',
          docType: 'page_content__email',
          doneType: 'document_create',
          file: {
            readabilityMarkdown: '{{READABILITY_CONTENTS}}',
          },
        },
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'DOC_ID',
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
                    title: 'Analyzing email',
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
          promptId: SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
          promptName: '[Summary] Summarize email (TL:DR)',
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
              id: SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize email (TL:DR)',
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
        ActionGetDictionaryValue: 'originalMessage.metadata.deepDive.value',
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value: 'Ask AI anything about the email...',
                    },
                  },
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
  keyTakeaways: (messageId) => [
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
                title: `Summarize email (Key takeaways)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing email',
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
      type: 'SET_VARIABLE',
      parameters: {
        Variable: {
          key: 'AUTO_LANGUAGE_NAME',
          value: 'auto',
          isBuiltIn: true,
          overwrite: true,
        },
      },
    },
    {
      type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '{{READABILITY_CONTENTS}}',
          docType: 'page_content__email',
          doneType: 'document_create',
          file: {
            readabilityMarkdown: '{{READABILITY_CONTENTS}}',
          },
        },
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'DOC_ID',
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
                    title: 'Analyzing email',
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
          promptId: SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
          promptName: '[Summary] Summarize email (Key takeaways)',
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
              id: SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize email (Key takeaways)',
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
        ActionGetDictionaryValue: 'originalMessage.metadata.deepDive.value',
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value: 'Ask AI anything about the email...',
                    },
                  },
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
  actions: (messageId) => [
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
                title: `Summarize email (Action items)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing email',
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
      type: 'SET_VARIABLE',
      parameters: {
        Variable: {
          key: 'AUTO_LANGUAGE_NAME',
          value: 'auto',
          isBuiltIn: true,
          overwrite: true,
        },
      },
    },
    {
      type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'MAXAI_UPLOAD_DOCUMENT',
      parameters: {
        MaxAIDocumentActionConfig: {
          link: '{{CURRENT_WEBPAGE_URL}}',
          pureText: '{{READABILITY_CONTENTS}}',
          docType: 'page_content__email',
          doneType: 'document_create',
          file: {
            readabilityMarkdown: '{{READABILITY_CONTENTS}}',
          },
        },
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'DOC_ID',
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
                    title: 'Analyzing email',
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
          promptId: SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
          promptName: '[Summary] Summarize email (Action items)',
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
              id: SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
              parent: 'root',
              droppable: false,
              text: '[Summary] Summarize email (Action items)',
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
        ActionGetDictionaryValue: 'originalMessage.metadata.deepDive.value',
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
                    deepDive: {
                      title: {
                        title: 'Deep dive',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value: 'Ask AI anything about the email...',
                    },
                  },
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
    // {
    //   type: 'MAXAI_SUMMARY_LOG',
    //   parameters: {},
    // },
  ],
}
