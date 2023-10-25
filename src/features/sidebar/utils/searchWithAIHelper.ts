import dayjs from 'dayjs'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { v4 as uuidV4 } from 'uuid'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { SEARCH_WITH_AI_PROMPT } from '@/features/searchWithAI/constants'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { textHandler } from '@/features/shortcuts/utils/textHelper'

/**
 * 智能query生成器
 */
export const SMART_SEARCH_PROMPT = `You are a research expert who is good at coming up with the perfect search query to help find answers to any question. Your task is to think of the most effective search query for the following question delimited by <question></question>:

<question>
{{current_question}}
</question>

The question is the final one in a series of previous questions and answers. Here are the earlier questions listed in the order they were asked, from the very first to the one before the final question, delimited by <previous_questions></previous_questions>:
<previous_questions>
{{previous_questions}}
</previous_questions>

For your reference, today's date is {{CURRENT_DATE}}.

Output the search query without additional context, explanation, or extra wording, just the search query itself. Don't use any punctuation, especially no quotes or backticks, around the search query.`

export const generateSmartSearchPromptWithPreviousQuestion = (
  questions: string[],
) => {
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

/**
 * 生成搜索引擎搜索的actions
 * @param query
 * @param prevQuestions
 * @param includeHistory
 */
export const generateSearchWithAIActions = async (
  query: string,
  prevQuestions: string[],
  includeHistory: boolean,
) => {
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
              shareType: 'search',
              title: {
                title: query,
              },
              copilot: {
                title: {
                  title: 'Quick search',
                  titleIcon: 'Bolt',
                  titleIconSize: 24,
                },
                steps: [
                  {
                    title: 'Understanding question',
                    status: 'loading',
                    icon: 'CheckCircle',
                  },
                ],
              },
            },
            include_history: includeHistory,
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
        AskChatGPTWithHistory: includeHistory,
        template: includeHistory
          ? generateSmartSearchPromptWithPreviousQuestion(
              prevQuestions.concat(currentQuestion),
            )
          : generateSmartSearchPromptWithPreviousQuestion([currentQuestion]),
        AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
        AskChatGPTActionMeta: {
          temperature: 0,
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
              copilot: {
                steps: [
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
              },
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
              copilot: {
                steps: [
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
              },
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
        AskChatGPTWithHistory: includeHistory,
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
  return actions
}
