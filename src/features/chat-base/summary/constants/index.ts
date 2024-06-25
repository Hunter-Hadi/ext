import { v4 as uuidV4 } from 'uuid'

import {
  SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID,
  SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
  SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
} from '@/constants'
import {
  IPageSummaryNavItem,
  IPageSummaryNavType,
  IPageSummaryType,
} from '@/features/chat-base/summary/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'

/**
 * summary actions配置，这里是默认的配置
 */
export const PAGE_SUMMARY_CONTEXT_MENU_MAP: Record<
  IPageSummaryType,
  IContextMenuItem
> = {
  PAGE_SUMMARY: {
    id: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
    parent: 'root',
    droppable: false,
    text: '[Summary] Summarize page',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
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
            AnalyzeChatFileImmediateUpdateConversation: true,
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
              promptId: 'test',
              promptName: 'test',
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
              // text: getSummaryPagePrompt('all'),
              text: '',
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              text: '',
              originalMessage: {
                metadata: {
                  deepDive: {
                    title: {
                      title: ' ',
                      titleIcon: 'Loading',
                    },
                  },
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
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  DEFAULT_EMAIL_SUMMARY: {
    id: SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
    parent: 'root',
    droppable: false,
    text: '[Summary] Summarize email',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
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
          type: 'ANALYZE_CHAT_FILE',
          parameters: {
            AnalyzeChatFileImmediateUpdateConversation: true,
            AnalyzeChatFileName: 'EmailSummaryContent.txt',
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
            AskChatGPTActionQuestion: {
              text: '',
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              text: '',
              originalMessage: {
                metadata: {
                  deepDive: {
                    title: {
                      title: ' ',
                      titleIcon: 'Loading',
                    },
                  },
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
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  PDF_CRX_SUMMARY: {
    id: SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
    parent: 'root',
    droppable: false,
    text: '[Summary] Summarize PDF',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
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
          type: 'UPLOAD_PDF_OF_CRX',
          parameters: {},
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
          type: 'ANALYZE_CHAT_FILE',
          parameters: {
            AnalyzeChatFileImmediateUpdateConversation: true,
            AnalyzeChatFileName: 'PDFSummaryContent.txt',
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
            AskChatGPTActionQuestion: {
              text: '',
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
              messageId: '{{AI_RESPONSE_MESSAGE_ID}}',
              text: '',
              originalMessage: {
                metadata: {
                  deepDive: {
                    title: {
                      title: ' ',
                      titleIcon: 'Loading',
                    },
                  },
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
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  YOUTUBE_VIDEO_SUMMARY: {
    id: SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
    parent: 'root',
    droppable: false,
    text: '[Summary] Summarize video',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
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
            AnalyzeChatFileImmediateUpdateConversation: true,
            AnalyzeChatFileName: 'YouTubeSummaryContent.txt',
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
            AskChatGPTActionQuestion: {
              text: '',
              meta: {
                outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
              messageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        {
          type: 'MAXAI_SUMMARY_LOG',
          parameters: {},
        },
      ],
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
}

/**
 * summary nav list配置
 */
export const PAGE_SUMMARY_NAV_LIST_MAP: Record<
  IPageSummaryType,
  IPageSummaryNavItem[]
> = {
  PAGE_SUMMARY: [
    {
      title: 'Summarize page',
      icon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__default',
    },
    {
      title: 'Summarize page (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__tldr',
    },
    {
      title: 'Summarize page (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__page_summary__tooltip__key_takeaways',
    },
  ],
  PDF_CRX_SUMMARY: [
    {
      title: 'Summarize PDF',
      icon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__default',
    },
    {
      title: 'Summarize PDF (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__pdf_crx_summary__tooltip__tldr',
    },
    {
      title: 'Summarize PDF (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__key_takeaways',
    },
  ],
  YOUTUBE_VIDEO_SUMMARY: [
    {
      title: 'Summarize video',
      icon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__default',
    },
    {
      title: 'Timestamped summary',
      icon: 'Bulleted',
      key: 'timestamped',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__timestamped',
    },
    {
      title: 'Summarize comments',
      icon: 'CommentOutlined',
      key: 'comment',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__comment',
    },
    {
      title: 'Show transcript',
      icon: 'ClosedCaptionOffOutlined',
      key: 'transcript',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__transcript',
    },
  ],
  DEFAULT_EMAIL_SUMMARY: [
    {
      title: 'Summarize email',
      icon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__default',
    },
    {
      title: 'Summarize email (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__tldr',
    },
    {
      title: 'Summarize email (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__key_takeaways',
    },
    {
      title: 'Summarize email (Action items)',
      icon: 'SubjectOutlined',
      key: 'actions',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__action_items',
    },
  ],
}

/**
 * summary nav actions配置，这里配置的是各个nav下触发的prompt_id
 * TODO 可以配置在PAGE_SUMMARY_NAV_LIST里，summary prompt后移后每个nav都对应一个prompt
 */
export const PAGE_SUMMARY_NAV_CONTEXT_MENU_MAP: Record<
  IPageSummaryType,
  Partial<Record<IPageSummaryNavType, { id: string; text: string }>>
  // Partial<Record<IPageSummaryNavType, IContextMenuItem>>
> = {
  PAGE_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
      text: `[Summary] Summarize page`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize page (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize page (Key takeaways)`,
    },
  },
  PDF_CRX_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
      text: `[Summary] Summarize PDF`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize PDF (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize PDF (Key takeaways)`,
    },
  },
  DEFAULT_EMAIL_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
      text: `[Summary] Summarize email`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize email (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize email (Key takeaways)`,
    },
    actions: {
      id: SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
      text: '[Summary] Summarize email (Action items)',
    },
  },
  YOUTUBE_VIDEO_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
      text: `[Summary] Summarize video`,
    },
    timestamped: {
      id: SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
      text: '[Summary] Timestamped summary',
    },
    comment: {
      id: SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
      text: '[Summary] Summarize comments',
    },
    transcript: {
      id: SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID,
      text: `[Summary] Show transcript`,
    },
  },
}
