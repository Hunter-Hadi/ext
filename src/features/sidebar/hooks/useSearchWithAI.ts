import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useSetRecoilState } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'

import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { getPermissionCardMessageByPermissionCardSettings } from '@/features/auth/components/PermissionWrapper/types'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import dayjs from 'dayjs'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { SEARCH_WITH_AI_PROMPT } from '@/features/searchWithAI/constants'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { v4 as uuidV4 } from 'uuid'

export const SMART_SEARCH_PROMPT = `You are a research expert who is good at coming up with the perfect search query to help find answers to any question. Your task is to think of the most effective search query for the following question delimited by <question></question>:

<question>
{{current_question}}
</question>

The question is the final one in a series of previous questions and answers. Here are the earlier questions listed in the order they were asked, from the very first to the one before the final question, delimited by <previous_questions></previous_questions>:
<previous_questions>
{{previous_questions}}
</previous_questions>

For your reference, today's date is {{CURRENT_DATE}}.

Output the search query without additional context, explanation, or extra wording, just the search query itself. Don't use any punctuation, especially no quotes or backticks, around the search query.Output the search query without additional context, explanation, or extra wording, just the search query itself. Don't use any punctuation, especially no quotes or backticks, around the search query.`

const generateSmartSearchPromptWithPreviousQuestion = (questions: string[]) => {
  let template = SMART_SEARCH_PROMPT

  template = template.replaceAll(
    '{{CURRENT_DATE}}',
    dayjs().format('YYYY-MM-DD HH:mm:ss'),
  )

  // questions 最后一个元素作为 current question
  const currentQuestion = questions[questions.length - 1]
  // 取出 questions 除了最后一个，剩下的都是 previousQuestion
  const previousQuestions = questions.slice(0, -1)

  template = template.replaceAll('{{current_question}}', currentQuestion)

  let previousQuestionsStr = ''
  previousQuestions.forEach((preQuestion, index) => {
    previousQuestionsStr += `${index + 1}) ${preQuestion}${
      index < previousQuestions.length - 1 ? '\n' : ''
    }`
  })

  template = template.replaceAll('{{previous_questions}}', previousQuestionsStr)

  return template
}

/**
 * 在搜索引擎搜索并总结片段后，真正发起提问的prompt
 * @param query
 */
const generatePromptTemplate = async (query: string) => {
  let promptTemplate = SEARCH_WITH_AI_PROMPT
  if (!promptTemplate) {
    return query
  }
  promptTemplate = promptTemplate.replaceAll('{query}', query)
  promptTemplate = promptTemplate.replace('{web_results}', '{{PAGE_CONTENT}}')
  promptTemplate = promptTemplate.replaceAll(
    '{current_date}',
    '{{CURRENT_DATE}}',
  )
  const userConfig = await clientGetLiteChromeExtensionDBStorage()
  if (userConfig.userSettings?.language) {
    promptTemplate =
      promptTemplate + `\nRespond in ${userConfig.userSettings?.language}`
  }
  return promptTemplate
}

const useSearchWithAI = () => {
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    currentSidebarConversationMessages,
  } = useSidebarSettings()
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const permissionCardMap = usePermissionCardMap()
  const { currentUserPlan } = useUserInfo()
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const [runActions, setRunActions] = useState<ISetActionsType>([])
  const { createConversation } = useClientConversation()
  const isFetchingRef = useRef(false)
  const memoPrevQuestions = useMemo(() => {
    return currentSidebarConversationMessages
      .filter((message) => message.type === 'ai')
      .map((aiMessage) => {
        return (
          (aiMessage as IAIResponseMessage)?.originalMessage?.metadata?.title ||
          aiMessage.text ||
          ''
        )
      })
  }, [currentSidebarConversationMessages])
  const createSearchWithAI = async (query: string) => {
    if (isFetchingRef.current) {
      return
    }
    console.log('新版Conversation 创建searchWithAI')
    //切换至Search的时候把ChatGPT（MaxAI）的provider的onboarding check设置为true
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_USE_CHAT_GPT_PLUS',
      true,
    )
    updateConversation((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
    try {
      console.log('新版Conversation search with AI 开始创建')
      // 进入loading
      const conversationId = await createConversation()
      updateConversation((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
      // 如果是免费用户
      if (currentUserPlan.name !== 'pro') {
        // 判断lifetimes free trial是否已经用完
        const searchLifetimesQuota =
          Number(
            (await getChromeExtensionOnBoardingData())
              .ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES,
          ) || 0
        if (searchLifetimesQuota > 0) {
          // 如果没有用完，那么就减一
          await setChromeExtensionOnBoardingData(
            'ON_BOARDING_RECORD_SEARCH_FREE_TRIAL_TIMES',
            searchLifetimesQuota - 1,
          )
        } else {
          await clientChatConversationModifyChatMessages(
            'add',
            conversationId,
            0,
            [
              getPermissionCardMessageByPermissionCardSettings(
                permissionCardMap['SIDEBAR_SEARCH_WITH_AI'],
              ),
            ],
          )
          authEmitPricingHooksLog('show', 'SIDEBAR_SEARCH_WITH_AI')
          return
        }
      }
      // search with AI 开始
      let currentQuestion = query
      let site = ''
      const siteCommandMatch = query.match(/\/site:(\S+)/)
      if (siteCommandMatch) {
        site = siteCommandMatch[1]
        currentQuestion = query.replace(siteCommandMatch[0], '')
      }
      currentQuestion = textHandler(currentQuestion, {
        trim: true,
        noQuotes: true,
        noCommand: true,
      })
      const actions: ISetActionsType = [
        {
          type: 'DATE',
          parameters: {
            DateActionMode: 'Current Date',
            DateFormatStyle: 'YYYY-MM-DD HH:mm:ss',
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'CURRENT_DATE',
          },
        },
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
                  title: query,
                  quickSearch: [
                    {
                      title: 'Understanding question',
                      status: 'loading',
                      icon: 'CheckCircle',
                    },
                  ],
                },
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
          type: 'ASK_CHATGPT',
          parameters: {
            template: generateSmartSearchPromptWithPreviousQuestion(
              memoPrevQuestions.concat(currentQuestion),
            ),
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
            AskChatGPTActionMeta: {
              messageVisibleText: query,
              contextMenu: {
                id: 'b481731b-19e3-4713-8f0b-81fd7b2d5169',
                droppable: false,
                parent: '',
                text: '[Search] smart query',
                data: {
                  editable: false,
                  type: 'shortcuts',
                  actions: [],
                },
              } as IContextMenuItem,
            },
            AskChatGPTWithHistory: true,
          },
        },
        {
          type: 'TEXT_HANDLER',
          parameters: {
            ActionTextHandleParameters: {
              trim: true,
              noQuotes: true,
              noCommand: true,
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'SMART_SEARCH_QUERY',
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
                  quickSearch: [
                    {
                      title: 'Understanding question',
                      status: 'complete',
                      icon: 'CheckCircle',
                    },
                    {
                      title: 'Searching web',
                      status: 'loading',
                      icon: 'Search',
                      value: '{{SMART_SEARCH_QUERY}}',
                    },
                  ],
                  sources: {
                    status: 'loading',
                    links: [],
                  },
                },
                content: {
                  contentType: 'text',
                  text: '',
                },
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'GET_CONTENTS_OF_SEARCH_ENGINE',
          parameters: {
            URLSearchEngine: 'google',
            URLSearchEngineParams: {
              q: `{{SMART_SEARCH_QUERY}}`,
              region: '',
              limit: '6',
              btf: '',
              nojs: '1',
              ei: 'UTF-8',
              csp: '1',
              site,
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'SEARCH_SOURCES',
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
                  title: query,
                  quickSearch: [
                    {
                      title: 'Understanding question',
                      status: 'complete',
                      icon: 'CheckCircle',
                    },
                    {
                      title: 'Searching web',
                      status: 'complete',
                      icon: 'Search',
                      value: '{{SMART_SEARCH_QUERY}}',
                    },
                  ],
                  sources: {
                    status: 'complete',
                    links: `{{SEARCH_SOURCES}}` as any,
                  },
                },
              },
            } as IAIResponseMessage,
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: `{{SEARCH_SOURCES}}`,
          },
        },
        {
          type: 'WEBGPT_SEARCH_RESULTS_EXPAND',
          parameters: {
            SummarizeActionType: 'NO_SUMMARIZE',
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'PAGE_CONTENT',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            AskChatGPTWithHistory: true,
            AskChatGPTInsertMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
            AskChatGPTActionMeta: {
              messageVisibleText: query,
              searchSources: '{{SEARCH_SOURCES}}',
              contextMenu: {
                id: '73361add-2d6a-4bf3-b2a7-5097551653e7',
                droppable: false,
                parent: '',
                text: '[Search] answer',
                data: {
                  editable: false,
                  type: 'shortcuts',
                  actions: [],
                },
              } as IContextMenuItem,
            },
            template: await generatePromptTemplate(currentQuestion),
          },
        },
      ]
      setRunActions(actions)
    } catch (e) {
      console.log('创建Conversation失败', e)
    }
  }
  const regenerateSearchWithAI = async () => {
    try {
      if (currentSidebarConversationId) {
        const lastQuestion = memoPrevQuestions[memoPrevQuestions.length - 1]
        if (lastQuestion) {
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            1,
            [],
          )
          await createSearchWithAI(lastQuestion)
        } else {
          // 如果没有找到last question，那么就重新生成Conversation
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            9999,
            [],
          )
        }
      }
    } catch (e) {
      console.log('重新生成Conversation失败', e)
    }
  }
  useEffect(() => {
    if (
      runActions.length > 0 &&
      !isFetchingRef.current &&
      currentSidebarConversationType === 'Search' &&
      currentSidebarConversationId
    ) {
      isFetchingRef.current = true
      if (setShortCuts(runActions)) {
        runShortCuts()
          .then()
          .catch()
          .finally(() => {
            isFetchingRef.current = false
            setRunActions([])
          })
      } else {
        setRunActions([])
        isFetchingRef.current = false
      }
    }
  }, [
    runShortCuts,
    setRunActions,
    currentSidebarConversationType,
    currentSidebarConversationId,
    runActions,
  ])
  return {
    createSearchWithAI,
    regenerateSearchWithAI,
  }
}
export default useSearchWithAI
