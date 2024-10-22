import { v4 as uuidV4 } from 'uuid'

import { VARIABLE_AI_RESPONSE_LANGUAGE } from '@/background/defaultPromptsData/systemVariables'
import {
  SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
} from '@/constants'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type PDF_SUMMARY_NAV_TYPES = 'all' | 'summary' | 'keyTakeaways'

export const PDF_SUMMARY_ACTIONS_MAP: {
  [key in PDF_SUMMARY_NAV_TYPES]: (messageId?: string) => ISetActionsType
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
                title: `Summarize PDF`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing PDF',
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
      type: 'GET_PDF_FILE_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'PDF_FILE',
      },
    },
    {
      type: 'GET_PDF_CONTENTS_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'TEXT_HANDLER',
      parameters: {
        ActionTextHandleParameters: {
          trim: true,
        },
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
          // 无PDF内容
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
                    copilot: {
                      steps: [
                        {
                          title: 'Analyzing PDF',
                          status: 'complete',
                          icon: 'SmartToy',
                          value: '{{CURRENT_WEBPAGE_TITLE}}',
                        },
                      ],
                    },
                    deepDive: {
                      title: {
                        title: 'Oops! We Can’t Read Your PDF',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value:
                        'It looks like the PDF you uploaded is either a picture or in a format we can’t read right now. We’re not able to get text from images or certain types of PDFs yet. Please try uploading a different PDF, or reach out to our support team for help.',
                    },
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有PDF内容
          {
            type: 'MAXAI_UPLOAD_DOCUMENT',
            parameters: {
              MaxAIDocumentActionConfig: {
                pureText: '{{READABILITY_CONTENTS}}',
                docType: 'page_content__pdf',
                doneType: 'document_create',
                file: '{{PDF_FILE}}' as any,
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
                          title: 'Analyzing PDF',
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
                promptId: SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
                promptName: '[Summary] Summarize PDF',
                promptActionType: 'chat_complete',
                variables: [VARIABLE_AI_RESPONSE_LANGUAGE],
                output: [],
              },
              AskChatGPTActionQuestion: {
                text: '',
                meta: {
                  outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                  contextMenu: {
                    id: SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
                    parent: 'root',
                    droppable: false,
                    text: '[Summary] Summarize PDF',
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
                'originalMessage.metadata.deepDive.value',
            },
          },
        ],
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
                      value: 'Ask AI anything about the PDF...',
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
                title: `Summarize PDF (TL;DR)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing PDF',
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
      type: 'GET_PDF_FILE_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'PDF_FILE',
      },
    },
    {
      type: 'GET_PDF_CONTENTS_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'TEXT_HANDLER',
      parameters: {
        ActionTextHandleParameters: {
          trim: true,
        },
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
          // 无PDF内容
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
                    copilot: {
                      steps: [
                        {
                          title: 'Analyzing PDF',
                          status: 'complete',
                          icon: 'SmartToy',
                          value: '{{CURRENT_WEBPAGE_TITLE}}',
                        },
                      ],
                    },
                    deepDive: {
                      title: {
                        title: 'Oops! We Can’t Read Your PDF',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value:
                        'It looks like the PDF you uploaded is either a picture or in a format we can’t read right now. We’re not able to get text from images or certain types of PDFs yet. Please try uploading a different PDF, or reach out to our support team for help.',
                    },
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有PDF内容
          {
            type: 'MAXAI_UPLOAD_DOCUMENT',
            parameters: {
              MaxAIDocumentActionConfig: {
                pureText: '{{READABILITY_CONTENTS}}',
                docType: 'page_content__pdf',
                doneType: 'document_create',
                file: '{{PDF_FILE}}' as any,
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
                          title: 'Analyzing PDF',
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
                promptId: SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
                promptName: '[Summary] Summarize PDF (TL:DR)',
                promptActionType: 'chat_complete',
                variables: [VARIABLE_AI_RESPONSE_LANGUAGE],
                output: [],
              },
              AskChatGPTActionQuestion: {
                text: '',
                meta: {
                  outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                  contextMenu: {
                    id: SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
                    parent: 'root',
                    droppable: false,
                    text: '[Summary] Summarize PDF (TL:DR)',
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
                'originalMessage.metadata.deepDive.value',
            },
          },
        ],
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
                      value: 'Ask AI anything about the PDF...',
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
                title: `Summarize PDF (Key takeaways)`,
              },
              copilot: {
                title: {
                  title: 'Page insights',
                  titleIcon: 'LaptopMac',
                },
                steps: [
                  {
                    title: 'Analyzing PDF',
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
      type: 'GET_PDF_FILE_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'PDF_FILE',
      },
    },
    {
      type: 'GET_PDF_CONTENTS_OF_CRX',
      parameters: {},
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'READABILITY_CONTENTS',
      },
    },
    {
      type: 'TEXT_HANDLER',
      parameters: {
        ActionTextHandleParameters: {
          trim: true,
        },
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
          // 无PDF内容
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
                    copilot: {
                      steps: [
                        {
                          title: 'Analyzing PDF',
                          status: 'complete',
                          icon: 'SmartToy',
                          value: '{{CURRENT_WEBPAGE_TITLE}}',
                        },
                      ],
                    },
                    deepDive: {
                      title: {
                        title: 'Oops! We Can’t Read Your PDF',
                        titleIcon: 'TipsAndUpdates',
                      },
                      value:
                        'It looks like the PDF you uploaded is either a picture or in a format we can’t read right now. We’re not able to get text from images or certain types of PDFs yet. Please try uploading a different PDF, or reach out to our support team for help.',
                    },
                  },
                  includeHistory: false,
                },
              } as IAIResponseMessage,
            },
          },
        ],
        WFConditionalIfFalseActions: [
          // 有PDF内容
          {
            type: 'MAXAI_UPLOAD_DOCUMENT',
            parameters: {
              MaxAIDocumentActionConfig: {
                pureText: '{{READABILITY_CONTENTS}}',
                docType: 'page_content__pdf',
                doneType: 'document_create',
                file: '{{PDF_FILE}}' as any,
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
                          title: 'Analyzing PDF',
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
                promptId: SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
                promptName: '[Summary] Summarize PDF (Key takeaways)',
                promptActionType: 'chat_complete',
                variables: [VARIABLE_AI_RESPONSE_LANGUAGE],
                output: [],
              },
              AskChatGPTActionQuestion: {
                text: '',
                meta: {
                  outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                  contextMenu: {
                    id: SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
                    parent: 'root',
                    droppable: false,
                    text: '[Summary] Summarize PDF (Key takeaways)',
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
                'originalMessage.metadata.deepDive.value',
            },
          },
        ],
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
                      value: 'Ask AI anything about the PDF...',
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
