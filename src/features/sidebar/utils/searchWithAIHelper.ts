import dayjs from 'dayjs'
import { v4 as uuidV4 } from 'uuid'

import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import {
  SEARCH__ANSWER__PROMPT_ID,
  SEARCH__SMART_QUERY__PROMPT_ID,
} from '@/constants'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { SEARCH_WITH_AI_PROMPT } from '@/features/searchWithAI/constants'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { textHandler } from '@/features/shortcuts/utils/textHelper'

export const SMART_SEARCH_PROMPT_OUTPUT_MULTIPLE = `You are a research expert who is good at coming up with the perfect search query to help find answers to any question. Your task is to think of the most effective search query for the following question delimited by <question></question>:

<question>
{{current_question}}
</question>

The question is the final one in a series of previous questions and answers. Here are the earlier questions listed in the order they were asked, from the very first to the one before the final question, delimited by <previous_questions></previous_questions>:
<previous_questions>
{{previous_questions}}
</previous_questions>

For your reference, today's date is {{CURRENT_DATE}}.

Output 3 search queries as JSON Array format without additional number, context, explanation, or extra wording, site information, just 3 text search queries as JSON Array format.`

export const SMART_SEARCH_PROMPT_OUTPUT_SINGLE = `You are a research expert who is good at coming up with the perfect search query to help find answers to any question. Your task is to think of the most effective search query for the following question delimited by <question></question>:

<question>
{{current_question}}
</question>

The question is the final one in a series of previous questions and answers. Here are the earlier questions listed in the order they were asked, from the very first to the one before the final question, delimited by <previous_questions></previous_questions>:
<previous_questions>
{{previous_questions}}
</previous_questions>

For your reference, today's date is {{CURRENT_DATE}}.

Output 1 search query as JSON Array format without additional number, context, explanation, or extra wording, site information, just 1 text search query as JSON Array format.`

// smart search 结果的分隔符
export const SMART_SEARCH_RESPONSE_DELIMITER = ','

export const generateSmartSearchPromptWithPreviousQuestion = (
  questions: string[],
  multiple = false,
) => {
  let template = multiple
    ? SMART_SEARCH_PROMPT_OUTPUT_MULTIPLE
    : SMART_SEARCH_PROMPT_OUTPUT_SINGLE

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
  return promptTemplate
}

/**
 * 生成搜索引擎搜索的actions
 * @param query
 * @param prevQuestions
 * @param includeHistory
 * @param copilot
 */
export const generateSearchWithAIActions = async (
  query: string,
  prevQuestions: string[],
  includeHistory: boolean,
) => {
  const {
    searchEngine = 'google',
    maxResultsCount = 6,
    copilot = false,
  } = (await getChromeExtensionLocalStorage()).sidebarSettings?.search || {}
  const messageId = uuidV4()
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
  const prevQuestionsText = includeHistory
    ? prevQuestions
        .map((question, index) => `${index + 1}) ${question}`)
        .join('\n')
    : ''
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
          messageId: messageId,
          text: '',
          originalMessage: {
            metadata: {
              shareType: 'search',
              title: {
                title: query,
              },
              copilot: {
                title: {
                  title: copilot ? 'Copilot' : 'Quick search',
                  titleIcon: copilot ? 'Awesome' : 'Bolt',
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
              includeHistory: includeHistory,
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
    // 为了触发askChatGPT的ai response language detection
    {
      type: 'SET_VARIABLE_MAP',
      parameters: {
        VariableMap: {
          SELECTED_TEXT: currentQuestion,
          PREVIOUS_QUESTIONS: prevQuestionsText,
          CURRENT_QUESTION: currentQuestion,
          SMART_QUERY_COUNT: copilot ? '3' : '1',
        },
      },
    },
    {
      type: 'ASK_CHATGPT',
      parameters: {
        AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
        MaxAIPromptActionConfig: {
          promptId: 'b481731b-19e3-4713-8f0b-81fd7b2d5169',
          promptName: '[Search] smart query',
          promptActionType: 'chat_complete',
          AIModel: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
          variables: [
            {
              label: 'Current question',
              VariableName: 'CURRENT_QUESTION',
              valueType: 'Text',
            },
            {
              label: 'Smart query count',
              VariableName: 'SMART_QUERY_COUNT',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
            {
              label: 'Previous questions',
              VariableName: 'PREVIOUS_QUESTIONS',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
            {
              label: 'Current date',
              VariableName: 'CURRENT_DATE',
              valueType: 'Text',
              systemVariable: true,
              hidden: true,
            },
          ],
          output: [
            {
              label: 'The completion string from the LLM',
              VariableName: 'ChatComplete',
              valueType: 'Text',
            },
          ],
        },
        AskChatGPTActionQuestion: {
          text: '',
          meta: {
            // smart query以{ response_in_json: true, streaming: false }请求调用
            // isEnabledJsonMode: true,
            includeHistory,
            temperature: 0,
            messageVisibleText: query,
            contextMenu: {
              id: SEARCH__SMART_QUERY__PROMPT_ID,
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
    },
    {
      type: 'TEXT_HANDLER',
      parameters: {
        ActionTextHandleParameters: {
          trim: true,
          noQuotes: true,
          noCommand: true,
          matchSquareBracketContent: true,
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
        URLSearchEngine: searchEngine,
        URLSearchEngineParams: {
          q: `{{SMART_SEARCH_QUERY}}`,
          region: '',
          limit: `${maxResultsCount}`,
          btf: '',
          nojs: '1',
          ei: 'UTF-8',
          csp: '1',
          site,
          splitWith: SMART_SEARCH_RESPONSE_DELIMITER,
        },
        SearchMode: 'enhance',
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'SEARCH_SOURCES',
      },
    },
    // {
    //   type: 'SET_VARIABLE_MAP',
    //   parameters: {
    //     VariableMap: {
    //       SEARCH_SOURCES: '',
    //       IMAGE_ARY: '',
    //     },
    //   },
    // },
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
                    valueType: 'tags',
                    value: '{{SMART_SEARCH_QUERY}}',
                  },
                ],
              },
              sources: {
                status: 'complete',
                links: `{{SEARCH_SOURCES}}` as any,
                videos: `{{IMAGE_ARY}}`,
                images: `{{IMAGE_ARY}}`,
                knowledgePanel: `{{SEARCH_KNOWLEDGE_PANEL}}`,
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
        SummarizeActionType: copilot ? 'MAP_REDUCE' : 'NO_SUMMARIZE',
        template: `You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. You task is to extract and summarize the information related to the following question, delimited by <question></question>, from the following text, delimited by <text></text>.

---

Question:
<question>
{{SMART_QUERY}}
</question>

Text:
<text>
{{WEBPAGE_CONTENT}}
</text>

---

Output a concise summary that is at most {{NUMBER_OF_WORDS}} words.

Use the following format:
<summary>
The summary of the text
</summary>

---

If there's no information related to question, delimited by <question></question>, in the text, delimited by <text></text>, simply reply N/A.

The text is sourced from the main content of the webpage at {{WEBPAGE_URL}}.
`,
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
        ActionGetDictionaryValue: 'sourceMedia',
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'SOURCEMEDIA',
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
                    valueType: 'tags',
                    value: '{{SMART_SEARCH_QUERY}}',
                  },
                ],
              },
              sources: {
                status: 'complete',
                links: `{{SEARCH_SOURCES}}` as any,
                media: `{{SOURCEMEDIA}}`,
                images: `{{IMAGE_ARY}}`,
              },
            },
          },
        } as IAIResponseMessage,
      },
    },
    {
      type: 'SCRIPTS_GET_DICTIONARY_VALUE',
      parameters: {
        ActionGetDictionaryKey: 'value',
        ActionGetDictionaryValue: 'template',
      },
    },
    {
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'TEMPLATE',
      },
    },
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{TEMPLATE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
      parameters: {
        AskChatGPTActionQuestion: {
          text: await generatePromptTemplate(currentQuestion),
          meta: {
            messageVisibleText: query,
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            includeHistory,
            contextMenu: {
              id: SEARCH__ANSWER__PROMPT_ID,
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
        },
        AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
      },
    },
  ]
  return {
    actions,
    messageId,
  }
}
