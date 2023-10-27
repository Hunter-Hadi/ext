import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'
import cloneDeep from 'lodash-es/cloneDeep'
import Browser from 'webextension-polyfill'
import { v4 as uuidV4 } from 'uuid'
import {
  getIframePageContent,
  isNeedGetIframePageContent,
} from '@/pages/content_script_iframe/iframePageContentHelper'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { isEmailWebsite } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { IAIResponseMessage } from '@/features/chatgpt/types'

export type IPageSummaryType =
  | 'PAGE_SUMMARY'
  | 'YOUTUBE_VIDEO_SUMMARY'
  | 'PDF_CRX_SUMMARY'
  | 'DEFAULT_EMAIL_SUMMARY'

export const PAGE_SUMMARY_CONTEXT_MENU_MAP: {
  [key in IPageSummaryType]: IContextMenuItem
} = {
  PAGE_SUMMARY: {
    id: 'f734efe5-c63e-490e-a0f1-ae5a248e0f16',
    parent: 'root',
    droppable: false,
    text: 'Summarize page',
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
                include_history: false,
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
                include_history: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects.

The context text is sourced from the main content of the webpage at {{CURRENT_WEBPAGE_URL}}.

Output a summary and a list of key takeaways respectively.
The summary should be a one-liner in at most 100 words.
The key takeaways should be in up to seven bulletpoints, the fewer the better.

---

Use the following format:
#### TL;DR
<summary of the text>

#### Key Takeaways
<list of key takeaways>

---

Respond in {{AI_RESPONSE_LANGUAGE}}.`,
            AskChatGPTInsertMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        {
          type: 'CREATE_WEBSITE_CONTEXT',
          parameters: {
            CreateWebsiteContextConfig: {
              summary: '{{SUMMARY_CONTENTS}}',
              meta: {
                readability: '{{READABILITY_CONTENTS}}',
              },
            },
          },
        },
      ],
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  DEFAULT_EMAIL_SUMMARY: {
    id: '8ed1bf33-efc9-4714-8b21-09ceede3e2a8',
    parent: 'root',
    droppable: false,
    text: 'Summarize email',
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
                include_history: false,
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
                        value: '{{CURRENT_WEBPAGE_TITLE}}}',
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
                include_history: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways and action items of the context text delimited by triple backticks in all relevant aspects. 

The context text comprises email messages from an email thread you received or sent on {{CURRENT_WEBSITE_DOMAIN}}.

Output a summary, a list of key takeaways, and a list of action items respectively.
The summary should be a one-liner in at most 100 words. 
The key takeaways should be in up to seven bulletpoints, the fewer the better.
When extracting the action items, identify only the action items that need the reader to take action, and exclude action items requiring action from anyone other than the reader. Output the action items in bulletpoints, and pick a good matching emoji for every bullet point.

---

Use the following format:
#### TL;DR
<summary of the text>

#### Key Takeaways
<list of key takeaways>

#### Action Items
<list of action items>

---

Respond in {{AI_RESPONSE_LANGUAGE}}.`,
            AskChatGPTInsertMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        {
          type: 'CREATE_WEBSITE_CONTEXT',
          parameters: {
            CreateWebsiteContextConfig: {
              summary: '{{SUMMARY_CONTENTS}}',
              meta: {
                readability: '{{READABILITY_CONTENTS}}',
              },
            },
          },
        },
      ],
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  PDF_CRX_SUMMARY: {
    id: '0c8c8bd7-1072-4fb7-9fad-cf6447b33896',
    parent: 'root',
    droppable: false,
    text: 'Summarize PDF',
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
                include_history: false,
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
                include_history: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 

The context text originates from the main content of a PDF viewed on the browser at {{CURRENT_WEBPAGE_URL}}.

Output a summary and a list of key takeaways respectively.
The summary should be a one-liner in at most 100 words.
The key takeaways should be in up to seven bulletpoints, the fewer the better.

---

Use the following format:
#### TL;DR
<summary of the text>

#### Key Takeaways
<list of key takeaways>

---

Respond in {{AI_RESPONSE_LANGUAGE}}.`,
            AskChatGPTInsertMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
        {
          type: 'CREATE_WEBSITE_CONTEXT',
          parameters: {
            CreateWebsiteContextConfig: {
              summary: '{{SUMMARY_CONTENTS}}',
              meta: {
                readability: '{{READABILITY_CONTENTS}}',
              },
            },
          },
        },
      ],
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
  YOUTUBE_VIDEO_SUMMARY: {
    id: '215bf574-3a68-4ac8-8fff-ccdd19150cb9',
    parent: 'root',
    droppable: false,
    text: 'Summarize video',
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
                include_history: false,
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
          type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'YOUTUBE_TRANSCRIPT',
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
                include_history: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: `{{YOUTUBE_TRANSCRIPT}}`,
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
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'READABILITY_CONTENTS',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 

The context text is the transcript of a video from {{CURRENT_WEBPAGE_URL}}.

Output a summary and a list of key takeaways respectively.
The summary should be a one-liner in at most 100 words.
The key takeaways should be in up to seven bulletpoints, the fewer the better.

---

Use the following format:
#### TL;DR
<summary of the text>

#### Key Takeaways
<list of key takeaways>

---

Respond in {{AI_RESPONSE_LANGUAGE}}.`,
            AskChatGPTInsertMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
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
                  deepDive: {
                    title: {
                      title: 'Deep dive',
                      titleIcon: 'TipsAndUpdates',
                    },
                    value: 'Ask AI anything about the video...',
                  },
                },
                include_history: false,
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'CREATE_WEBSITE_CONTEXT',
          parameters: {
            CreateWebsiteContextConfig: {
              summary: '{{SUMMARY_CONTENTS}}',
              meta: {
                readability: '{{READABILITY_CONTENTS}}',
              },
            },
          },
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

export const getContextMenuActionsByPageSummaryType = (
  pageSummaryType: IPageSummaryType,
) => {
  const contextMenu = cloneDeep(PAGE_SUMMARY_CONTEXT_MENU_MAP[pageSummaryType])
  let messageId = ''
  const actions = (contextMenu.data.actions || []).map((action, index) => {
    if (index === 0) {
      messageId = action.parameters.ActionChatMessageConfig?.messageId || ''
    }
    if (action.type === 'ASK_CHATGPT') {
      action.parameters.AskChatGPTActionMeta = {
        contextMenu: cloneDeep(contextMenu),
      }
    }
    return action
  })
  return {
    actions,
    messageId,
  }
}

const getCurrentPageUrl = () => {
  const pageUrl = window.location.href
  return pageUrl
}

export const getPageSummaryConversationId = () => {
  return md5TextEncrypt(getCurrentPageUrl())
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
  return ['docs.google.com'].find((item) => item === host)
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
  }
  return ''
}
