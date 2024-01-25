import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { isEmailWebsite } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
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
              text: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects.

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
`,
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
              text: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways and action items of the context text delimited by triple backticks in all relevant aspects. 

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
`,
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
              text: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 

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
`,
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
            OperationElementElementSelector: 'ytd-watch-metadata #title',
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
              text: `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 

The context text is the information and/or transcript of a video from {{CURRENT_WEBPAGE_URL}}.

Output a summary and a list of key takeaways respectively.
The summary should be a one-liner in at most 100 words.
The key takeaways should be in up to seven bulletpoints, the fewer the better.

---

Use the following format:
#### TL;DR
<summary of the text>

#### Key Takeaways
<list of key takeaways>
`,
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
                  deepDive: {
                    title: {
                      title: 'Deep dive',
                      titleIcon: 'TipsAndUpdates',
                    },
                    value: 'Ask AI anything about the video...',
                  },
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
    if (
      action.type === 'ASK_CHATGPT' &&
      action.parameters.AskChatGPTActionQuestion
    ) {
      action.parameters.AskChatGPTActionQuestion = {
        ...action.parameters.AskChatGPTActionQuestion,
        meta: {
          ...action.parameters.AskChatGPTActionQuestion.meta,
          contextMenu: cloneDeep(contextMenu),
        },
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

const PAGE_SUMMARY_CONVERSATION_ID_MAP: {
  [key in string]: string
} = {}
export const getPageSummaryConversationId = () => {
  const pageUrl = getCurrentPageUrl()
  if (!PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]) {
    PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl] = md5TextEncrypt(
      getCurrentPageUrl(),
    )
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
