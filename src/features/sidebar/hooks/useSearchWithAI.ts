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
import {
  IUserChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { getDefaultPrompt } from '@/features/sidebar/utils/searchWithAIHelper'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'

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
  let promptTemplate = getDefaultPrompt() || ''
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
  const [prevQuery, setPrevQuery] = useState('')
  const [prevOptions, setPrevOptions] = useState<IUserChatMessageExtraType>({})
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const permissionCardMap = usePermissionCardMap()
  const { currentUserPlan } = useUserInfo()
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const [runActions, setRunActions] = useState<ISetActionsType>([])
  const { createConversation } = useClientConversation()
  const isFetchingRef = useRef(false)
  const memoPrevQuestions = useMemo(() => {
    return currentSidebarConversationMessages
      .filter((message) => message.type === 'user')
      .map((userMessage) => {
        return (
          (userMessage as IUserChatMessage)?.extra?.meta?.messageVisibleText ||
          userMessage.text ||
          ''
        )
      })
  }, [currentSidebarConversationMessages])
  const createSearchWithAI = async (
    query: string,
    options: IUserChatMessageExtraType,
  ) => {
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
          type: 'ASK_CHATGPT',
          parameters: {
            template: generateSmartSearchPromptWithPreviousQuestion(
              memoPrevQuestions.concat(currentQuestion),
            ),
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN_ANSWER',
            AskChatGPTActionMeta: {
              ...options.meta,
              messageVisibleText: query,
            },
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
          type: 'GET_CONTENTS_OF_SEARCH_ENGINE',
          parameters: {
            URLSearchEngine: 'google',
            URLSearchEngineParams: {
              region: 'us',
              limit: '10',
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
            VariableName: 'PAGE_CONTENT',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN_QUESTION',
            AskChatGPTActionMeta: {
              messageVisibleText: query,
            },
            template: await generatePromptTemplate(currentQuestion),
          },
        },
      ]
      setPrevQuery(query)
      setPrevOptions(options)
      setRunActions(actions)
    } catch (e) {
      console.log('创建Conversation失败', e)
    }
  }
  const regenerateSearchWithAI = async () => {
    try {
      if (currentSidebarConversationId) {
        if (prevQuery) {
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            2,
            [],
          )
          await createSearchWithAI(prevQuery, prevOptions)
        } else {
          let deleteCount = 0
          let userMessage: IUserChatMessage | null = null
          // find last user message
          for (
            let i = currentSidebarConversationMessages.length - 1;
            i >= 0;
            i--
          ) {
            if (currentSidebarConversationMessages[i].type === 'user') {
              userMessage = currentSidebarConversationMessages[
                i
              ] as IUserChatMessage
              deleteCount = currentSidebarConversationMessages.length - i
              break
            }
          }
          await clientChatConversationModifyChatMessages(
            'delete',
            currentSidebarConversationId,
            deleteCount,
            [],
          )
          if (userMessage?.extra?.meta?.messageVisibleText) {
            await createSearchWithAI(
              userMessage.extra.meta.messageVisibleText,
              userMessage.extra,
            )
          } else {
            // 如果没有找到user message，那么就重新生成Conversation
            await clientChatConversationModifyChatMessages(
              'delete',
              currentSidebarConversationId,
              9999,
              [],
            )
          }
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
