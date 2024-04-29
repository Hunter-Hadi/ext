import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { type IContextMenuIconKey } from '@/components/ContextMenuIcon'
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
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { IAction, ISetActionsType } from '@/features/shortcuts/types/Action'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { isEmailWebsite } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
import {
  getSummaryEmailPrompt,
  getSummaryPagePrompt,
  getSummaryPdfPrompt,
  getSummaryYoutubeVideoPrompt,
  summaryGetPromptObject,
  SummaryParamsPromptType,
} from '@/features/sidebar/utils/pageSummaryNavPrompt'
import { youTubeSummaryChangeTool } from '@/features/sidebar/utils/summaryActionsChangeTool/youTubeSummaryChangeTool'
import { I18nextKeysType } from '@/i18next'
import {
  getIframePageContent,
  isNeedGetIframePageContent,
} from '@/pages/content_script_iframe/iframePageContentHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { md5TextEncrypt } from '@/utils/encryptionHelper'

export type IPageSummaryType =
  | 'PAGE_SUMMARY'
  | 'YOUTUBE_VIDEO_SUMMARY'
  | 'PDF_CRX_SUMMARY'
  | 'DEFAULT_EMAIL_SUMMARY'

export const PAGE_SUMMARY_CONTEXT_MENU_MAP: {
  [key in IPageSummaryType]: IContextMenuItem
} = {
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
            AskChatGPTActionQuestion: {
              text: getSummaryPagePrompt('all'),
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
                status: 'complete',
                metadata: {
                  isComplete: true,
                  deepDive: {
                    title: {
                      title: 'Deep dive',
                      titleIcon: 'TipsAndUpdates',
                    },
                    value: 'Ask AI anything about the page...',
                  },
                },
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
            AnalyzeChatFileImmediateUpdateConversation: false,
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
              text: getSummaryEmailPrompt('all'),
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
            AnalyzeChatFileImmediateUpdateConversation: false,
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
              text: getSummaryPdfPrompt('all'),
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
              text: getSummaryYoutubeVideoPrompt('all'),
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

export const allSummaryNavList: {
  [key in IPageSummaryType]: {
    title: string
    titleIcon: string
    key: SummaryParamsPromptType
    config?: {
      isAutoScroll?: boolean
    }
    tooltip: I18nextKeysType
  }[]
} = {
  PAGE_SUMMARY: [
    {
      title: 'Summarize page',
      titleIcon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__default',
    },
    {
      title: 'Summarize page (TL;DR)',
      titleIcon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__tldr',
    },
    {
      title: 'Summarize page (Key takeaways)',
      titleIcon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__page_summary__tooltip__key_takeaways',
    },
  ],
  PDF_CRX_SUMMARY: [
    {
      title: 'Summarize PDF',
      titleIcon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__default',
    },
    {
      title: 'Summarize PDF (TL;DR)',
      titleIcon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__pdf_crx_summary__tooltip__tldr',
    },
    {
      title: 'Summarize PDF (Key takeaways)',
      titleIcon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__key_takeaways',
    },
  ],
  YOUTUBE_VIDEO_SUMMARY: [
    {
      title: 'Summarize video',
      titleIcon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__default',
    },
    {
      title: 'Timestamped summary',
      titleIcon: 'Bulleted',
      key: 'timestamped',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__timestamped',
    },
    {
      title: 'Summarize comments',
      titleIcon: 'CommentOutlined',
      key: 'comment',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__comment',
    },
    {
      title: 'Show transcript',
      titleIcon: 'ClosedCaptionOffOutlined',
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
      titleIcon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__default',
    },
    {
      title: 'Summarize email (TL;DR)',
      titleIcon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__tldr',
    },
    {
      title: 'Summarize email (Key takeaways)',
      titleIcon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__key_takeaways',
    },
    {
      title: 'Summarize email (Action items)',
      titleIcon: 'SubjectOutlined',
      key: 'actions',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__action_items',
    },
  ],
}
export const getSummaryNavItemByType = (
  type: IPageSummaryType,
  value: string,
  valueType: 'title' | 'titleIcon' | 'key' = 'key',
) => {
  if (valueType === 'key' && !value) value = 'all' //默认赋值，防止异常
  const summaryNavItem = allSummaryNavList[type].find(
    (item) => item[valueType] === value,
  )
  if (valueType === 'key' && !summaryNavItem) {
    //防止summary nav key 找元素的时候，异常，因为nav有可能会删除
    return allSummaryNavList[type].find((item) => item[valueType] === 'all')
  } else {
    return summaryNavItem
  }
}
export const getContextMenuActionsByPageSummaryType = async (
  pageSummaryType: IPageSummaryType,
  currentConversationKey?: SummaryParamsPromptType,
) => {
  try {
    let summaryNavKey = currentConversationKey
    if (!summaryNavKey) {
      const chromeExtensionData = await getChromeExtensionLocalStorage()
      //获取summary导航数据 逻辑
      summaryNavKey =
        chromeExtensionData.sidebarSettings?.summary?.currentNavType?.[
          pageSummaryType
        ] || 'all'
    }
    const summaryNavPrompt =
      summaryGetPromptObject[pageSummaryType](summaryNavKey)
    const summaryNaTitle = getSummaryNavItemByType(
      pageSummaryType,
      summaryNavKey,
      'key',
    )?.title
    const summaryNavActions = await getSummaryNavActions({
      type: pageSummaryType,
      prompt: summaryNavPrompt,
      title: summaryNaTitle,
      key: summaryNavKey,
    })

    let messageId = ''
    const actions = summaryNavActions.map((action, index) => {
      if (index === 0) {
        messageId = action.parameters.ActionChatMessageConfig?.messageId || ''
      }
      if (
        action.type === 'ASK_CHATGPT' &&
        action.parameters.AskChatGPTActionQuestion
      ) {
        action.parameters.AskChatGPTActionQuestion = {
          ...action.parameters.AskChatGPTActionQuestion,
          meta: {
            ...action.parameters.AskChatGPTActionQuestion.meta,
          },
        }
      }
      return action
    })
    return {
      actions,
      messageId,
      summaryNavKey,
    }
  } catch (e) {
    console.log(e)
    return undefined
  }
}
//   | 'all'
//   | 'summary'
//   | 'keyTakeaways'
//   | 'comment'
//   | 'transcript'
//   | 'actions'
//   | 'timestamped'
export const SummaryContextMenuOverwriteMap: Record<
  IPageSummaryType,
  Partial<
    Record<
      SummaryParamsPromptType,
      {
        id: string
        text: string
      }
    >
  >
> = {
  PAGE_SUMMARY: {
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

export interface IGetSummaryNavActionsParams {
  type: IPageSummaryType
  messageId?: string
  prompt: string
  key: SummaryParamsPromptType
  title?: string
}
//获取不同总结nav的Actions
export const getSummaryNavActions: (
  params: IGetSummaryNavActionsParams,
) => Promise<ISetActionsType> = async (params) => {
  try {
    const contextMenu = cloneDeep(PAGE_SUMMARY_CONTEXT_MENU_MAP[params.type])
    let currentActions = cloneDeep(contextMenu.data.actions || [])
    // 减少message的大小
    contextMenu.data.actions = []
    if (params.type === 'YOUTUBE_VIDEO_SUMMARY') {
      currentActions = await youTubeSummaryChangeTool(params, currentActions) //进行actions增改
    }
    if (params.messageId) {
      //传入messageId 代表 采用之前的msg
      currentActions = currentActions?.filter((item) => {
        if (item.parameters.ActionChatMessageOperationType === 'add') {
          return false
        }
        return true
      })
    }
    //下面代码等youTubeSummaryChangeTool actions完善可以去除
    currentActions = currentActions.map((action) => {
      if (
        action.parameters.ActionChatMessageOperationType === 'add' &&
        params.title
      ) {
        const actionTitle = (
          action.parameters?.ActionChatMessageConfig as IAIResponseMessage
        )?.originalMessage?.metadata?.title
        if (actionTitle) {
          actionTitle.title = params.title
        }
      }
      if (
        params.messageId &&
        action?.parameters?.ActionChatMessageConfig?.messageId
      ) {
        action.parameters.ActionChatMessageConfig.messageId = params.messageId
      }
      if (
        params.messageId &&
        action?.parameters?.AskChatGPTActionQuestion?.meta?.outputMessageId
      ) {
        action.parameters.AskChatGPTActionQuestion.meta.outputMessageId =
          params.messageId
      }
      // TODO 临时的处理，需要重构
      const processAskChatGPTAction = (action: IAction) => {
        if (
          action.type === 'ASK_CHATGPT' &&
          action.parameters.AskChatGPTActionQuestion
        ) {
          if (!action.parameters.AskChatGPTActionQuestion.meta) {
            action.parameters.AskChatGPTActionQuestion.meta = {}
          }

          const contextMenuOverwriteData =
            SummaryContextMenuOverwriteMap?.[params.type]?.[params.key]
          if (contextMenuOverwriteData) {
            contextMenu.id = contextMenuOverwriteData.id
            contextMenu.text = contextMenuOverwriteData.text
          }
          console.log(
            `contextMenu show Text: [${contextMenu.text}]-[${contextMenu.id}]`,
          )
          action.parameters.AskChatGPTActionQuestion.meta.contextMenu =
            contextMenu
        }
        return action
      }
      if (
        params.prompt &&
        action.type === 'ASK_CHATGPT' &&
        action.parameters.AskChatGPTActionQuestion
      ) {
        action.parameters.AskChatGPTActionQuestion.text = params.prompt
        action = processAskChatGPTAction(action as IAction)
      }
      if (action.type === 'SCRIPTS_CONDITIONAL') {
        if (action.parameters.WFConditionalIfTrueActions) {
          action.parameters.WFConditionalIfTrueActions =
            action.parameters.WFConditionalIfTrueActions.map((action) =>
              processAskChatGPTAction(action as IAction),
            )
        }
        if (action.parameters.WFConditionalIfFalseActions) {
          action.parameters.WFConditionalIfFalseActions =
            action.parameters.WFConditionalIfFalseActions.map((action) =>
              processAskChatGPTAction(action as IAction),
            )
        }
      }
      return action
    })
    if (params.messageId) {
      const defAction: ISetActionsType = [
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              messageId: params.messageId || '',
              text: '',
              originalMessage: {
                metadata: {
                  isComplete: false,
                  copilot: {
                    steps: [
                      {
                        title: getSummaryActionCopilotStepTitle(params.type),
                        status: 'loading',
                        icon: 'SmartToy',
                        value: '{{CURRENT_WEBPAGE_TITLE}}',
                      },
                    ],
                  },
                  title: {
                    title: params.title || 'Summary',
                  },
                  deepDive:
                    params.type === 'YOUTUBE_VIDEO_SUMMARY'
                      ? []
                      : {
                          title: {
                            title: '',
                            titleIcon: '',
                          },
                          value: '',
                        },
                },
                content: {
                  title: {
                    title: 'noneShowContent', //隐藏之前的summary 因为content无法被undefined重制为空
                  },
                  text: '',
                  contentType: 'text',
                },
                includeHistory: false,
              },
            } as IAIResponseMessage,
          },
        },
      ]
      return [...defAction, ...currentActions]
    } else {
      return [...currentActions]
    }
  } catch (e) {
    console.log(e)
  }
  return []
}

export const getSummaryActionCopilotStepTitle = (type: IPageSummaryType) => {
  switch (type) {
    case 'PAGE_SUMMARY':
      return 'Summarize page'
    case 'YOUTUBE_VIDEO_SUMMARY':
      return 'Summarize video'
    case 'PDF_CRX_SUMMARY':
      return 'Summarize PDF'
    case 'DEFAULT_EMAIL_SUMMARY':
      return 'Summarize email'
  }
}

const getCurrentPageUrl = () => {
  const pageUrl = window.location.href
  return pageUrl
}

const PAGE_SUMMARY_CONVERSATION_ID_MAP: {
  [key in string]: string
} = {}
export const getPageSummaryConversationId = (url?: string) => {
  const pageUrl = url || getCurrentPageUrl()
  if (!PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]) {
    PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl] = md5TextEncrypt(pageUrl)
  }
  return PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]
}
export const getPageSummaryType = (): IPageSummaryType => {
  if (getCurrentDomainHost() === 'youtube.com') {
    if (YoutubeTranscript.retrieveVideoId(window.location.href)) {
      return 'YOUTUBE_VIDEO_SUMMARY'
    }
  }
  const url = new URL(location.href)
  const PDFViewerHref = `${Browser.runtime.id}/pages/pdf/web/viewer.html`
  if (url.href.includes(PDFViewerHref)) {
    return 'PDF_CRX_SUMMARY'
  }
  if (isEmailWebsite()) {
    return 'DEFAULT_EMAIL_SUMMARY'
  }
  return 'PAGE_SUMMARY'
}

export const getIframeOrSpecialHostPageContent = async (): Promise<string> => {
  let pageContent = ''
  // 判断是不是需要从iframe获取网页内容: Microsoft word
  if (isNeedGetIframePageContent()) {
    pageContent = await getIframePageContent()
  } else if (isNeedGetSpecialHostPageContent()) {
    // 判断是不是需要从特殊网站获取网页内容： google docs
    pageContent = await getSpecialHostPageContent()
  }
  pageContent = pageContent.trim()
  return pageContent
}

const isNeedGetSpecialHostPageContent = () => {
  const host = getCurrentDomainHost()
  return ['docs.google.com', 'cnbc.com', 'github.com'].find(
    (item) => item === host,
  )
}
const getSpecialHostPageContent = async () => {
  const host = getCurrentDomainHost()
  if (host === 'docs.google.com') {
    return new Promise<string>((resolve) => {
      const eventId = uuidV4()
      const script = document.createElement('script')
      script.type = 'module'
      script.src = Browser.runtime.getURL('pages/googleDoc/index.js')
      script.setAttribute('data-event-id', eventId)
      script.id = 'MAXAI_GOOGLE_DOC_CONTENT_SCRIPT'
      document.body.appendChild(script)
      let isResolved = false
      window.addEventListener(
        `${eventId}res`,
        (e) => {
          if (isResolved) {
            return
          }
          isResolved = true
          resolve((e as any).detail)
        },
        { once: true },
      )
      // 10s后如果没有获取到内容，就直接返回
      setTimeout(() => {
        if (isResolved) {
          return
        }
        isResolved = true
        resolve('')
      }, 10000)
    })
  } else if (host === 'cnbc.com') {
    const mainContainer = document.querySelector(
      '#MainContentContainer',
    ) as HTMLDivElement
    if (mainContainer) {
      return getPageContentWithMozillaReadability(mainContainer)
    }
    return ''
  } else if (host === 'github.com') {
    const githubPageUrl = new URL(location.href)
    const githubPagePathName = githubPageUrl.pathname
    const repoAuthor = githubPagePathName.split('/')[1]
    const repoName = githubPagePathName.split('/')[2]
    // 判断是不是代码页面
    if (document.querySelector('#copilot-button-positioner')) {
      // ## File Information
      //   - Repository Name: [Repository Name](Repository Link)
      //   - File Name: File Name
      //   - File Path: File Path
      //   - File Source link: File Source link
      // ## File Content
      //   ```
      //   ```
      const fileName = githubPagePathName.split('/').pop()
      let pageContent = ``
      pageContent += `## File Information\n`
      pageContent += `- Repository Name: [${repoName}](${githubPageUrl.origin}/${repoAuthor}/${repoName})\n`
      pageContent += `- File Name: ${fileName}\n`
      pageContent += `- File Path: ${githubPagePathName}\n`
      pageContent += `- File Source link: ${githubPageUrl.href}\n`
      pageContent += `## File Content\n`
      let code = 'N/A'
      const rawLink = document.querySelector(
        'a[data-testid="raw-button"]',
      ) as HTMLAnchorElement
      if (rawLink) {
        const response = await clientFetchAPI(rawLink.href, {
          parse: 'text',
        })
        if (response.success) {
          code = response.data
        }
      }
      pageContent += `\`\`\`\n${code}\n\`\`\`\n`
      return pageContent
    } else if (/issues\/\d+/.test(githubPagePathName)) {
      // 判断是不是issue页面
      // ## GitHub issue title
      //   - Repository Name: [Repository Name](Repository Link)
      //   - Repository issue link: [Repository Name](Repository Link)
      // ### Comments
      // #### Comment 1
      //   Author: [@username](link-to-user-profile)
      //   Date: [timestamp]
      //   Comment content.
      //   Metadata: Commenters/Collaborator/Author
      // #### Comment 2
      //   Author: [@username](link-to-user-profile)
      //   Date: [timestamp]
      //   Metadata: Commenters/Collaborator/Author
      //   Comment content.
      // ...
      const parseGithubIssueItem = (githubIssueComment: HTMLDivElement) => {
        if (!githubIssueComment) {
          return {
            author: '',
            date: '',
            content: '',
            metadata: '',
          }
        }
        const author = githubIssueComment.querySelector(
          'a.author',
        ) as HTMLAnchorElement
        const date = githubIssueComment.querySelector(
          'relative-time',
        ) as HTMLTimeElement
        const content =
          (githubIssueComment.querySelector(
            '.user-select-contain',
          ) as HTMLDivElement) ||
          (githubIssueComment.querySelector('table') as HTMLTableElement)
        const metadata = githubIssueComment.querySelector(
          '.timeline-comment-header div > span > span',
        ) as HTMLSpanElement
        return {
          author: author?.innerText || '',
          date: date?.getAttribute('datetime') || date?.title || '',
          content:
            content?.innerText
              .replace(/\n\s+/g, '\n')
              .replace(/\n{2,}/g, '\n\n')
              .trim() || 'N/A',
          metadata: metadata?.innerText || 'Commenters',
        }
      }
      const issueTitle = document.querySelector(
        '.js-issue-title',
      ) as HTMLAnchorElement
      const FirstComment = document.querySelector(
        '.js-discussion > div',
      ) as HTMLDivElement
      if (FirstComment) {
        const comments = [parseGithubIssueItem(FirstComment)]
        const otherCommentsUrl = new URL(window.location.href)
        otherCommentsUrl.pathname =
          otherCommentsUrl.pathname + `/partials/load_more`
        const result = await clientFetchAPI(otherCommentsUrl.href, {
          parse: 'text',
        })
        if (result.success) {
          // parse dom
          const dom = new DOMParser().parseFromString(result.data, 'text/html')
          const othorComments = dom.querySelectorAll(
            '.js-timeline-item',
          ) as NodeListOf<HTMLDivElement>
          othorComments.forEach((item) => {
            comments.push(parseGithubIssueItem(item))
          })
        }
        let pageContent = ``
        pageContent += `## ${issueTitle?.innerText}\n`
        pageContent += `- Repository Name: [${repoName}](${githubPageUrl.origin}/${repoAuthor}/${repoName})\n`
        pageContent += `- Repository issue link: ${githubPageUrl.href}\n`
        comments.forEach((item, index) => {
          pageContent += `### Comment ${index + 1}\n`
          // NOTE: 浪费tokens
          // pageContent += `- Author: [${item.author}](${githubPageUrl.origin}/${item.author})\n`
          pageContent += `- Author: ${item.author}\n`
          pageContent += `- Date: ${item.date}\n`
          pageContent += `- Metadata: ${item.metadata}\n`
          pageContent += `${item.content}\n`
        })
        return pageContent
      }
    }
  }
  return ''
}

// 24.04.29: support custom prompt feature for Summary
// get the actions of the custom prompt and mix with Summary actions, then return
export const getSummaryCustomPromptActions = async ({
  type,
  messageId = '',
  title,
  icon,
  actions: customPromptActions = [],
}: {
  type: IPageSummaryType
  messageId: string
  title: string
  icon?: IContextMenuIconKey
  actions: ISetActionsType
}) => {
  try {
    const currentCustomPromptActions = cloneDeep(customPromptActions)

    const actions = cloneDeep(PAGE_SUMMARY_CONTEXT_MENU_MAP[type].data.actions!)
    const askActionIndex = actions.findIndex(
      (action) => action.type === 'ASK_CHATGPT',
    )

    if (askActionIndex !== -1) {
      actions.splice(askActionIndex, 1, ...currentCustomPromptActions)
    } else {
      actions.push(...currentCustomPromptActions)
    }

    // if (messageId) {
    //   const defActions: ISetActionsType = [
    //     {
    //       type: 'CHAT_MESSAGE',
    //       parameters: {
    //         ActionChatMessageOperationType: 'update',
    //         ActionChatMessageConfig: {
    //           type: 'ai',
    //           messageId,
    //           text: '',
    //           originalMessage: {
    //             metadata: {
    //               isComplete: false,
    //               copilot: {
    //                 steps: [
    //                   {
    //                     title,
    //                     status: 'loading',
    //                     icon,
    //                     value: '{{CURRENT_WEBPAGE_TITLE}}',
    //                   },
    //                 ],
    //               },
    //               title: {
    //                 title: title || 'Summary',
    //               },
    //               deepDive:
    //                 type === 'YOUTUBE_VIDEO_SUMMARY'
    //                   ? []
    //                   : {
    //                       title: {
    //                         title: '',
    //                         titleIcon: '',
    //                       },
    //                       value: '',
    //                     },
    //             },
    //             content: {
    //               title: {
    //                 title: 'noneShowContent', //隐藏之前的summary 因为content无法被undefined重制为空
    //               },
    //               text: '',
    //               contentType: 'text',
    //             },
    //             includeHistory: false,
    //           },
    //         } as IAIResponseMessage,
    //       },
    //     },
    //   ]
    //   actions.push(...defActions)
    // }

    return actions
  } catch (err) {
    console.error(err)
  }
  return []
}
