import { v4 as uuidV4 } from 'uuid'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import {
  IPromptLibraryCardData,
  IPromptLibraryCardDetailData,
  IPromptLibraryCardDetailVariable,
  IPromptLibraryCardDetailVariableType,
} from '@/features/prompt_library/types'
import { PRESET_VARIABLE_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

/**
 * 把prompt library card detail的数据转换成Actions
 * @param promptLibraryCard
 */
export const promptLibraryCardDetailDataToActions = (
  promptLibraryCard: IPromptLibraryCardData,
): ISetActionsType => {
  const actions: ISetActionsType = []
  let template = promptLibraryCard.prompt_template || ''
  const variableMap = new Map<string, IActionSetVariable>()
  const customVariables: IActionSetVariable[] = []
  const systemVariables: IActionSetVariable[] = []
  let isOriginalMessage = false
  promptLibraryCard.variables?.forEach((promptLibraryCardVariable) => {
    const customVariable: IActionSetVariable = {
      VariableName: promptLibraryCardVariable.name,
      label: promptLibraryCardVariable.name,
      placeholder: promptLibraryCardVariable.hint,
      valueType: 'Text',
      systemVariable: promptLibraryCardVariable.isSystemVariable,
    }
    // 相当于自定义变量
    if (promptLibraryCardVariable.type === 'text') {
      customVariables.push(customVariable)
    }
    variableMap.set(customVariable.VariableName, customVariable)
  })
  // 执行一些需要运行的操作：Current Date, live crawling、web search
  const specialActions: ISetActionsType = []
  // 设置的日期
  if (variableMap.get('System Current Date')) {
    specialActions.push({
      type: 'DATE',
      parameters: {
        DateActionMode: 'Current Date',
        DateFormatStyle: 'YYYY-MM-DD HH:mm:ss',
      },
    })
    specialActions.push({
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'SYSTEM_CURRENT_DATE',
      },
    })
  }
  // 获取live crawling的内容
  if (promptLibraryCard.variable_types?.includes('livecrawling')) {
    systemVariables.push(PRESET_VARIABLE_MAP.LIVE_CRAWLING_TARGET_URL)
    // 替换模板里面的变量
    template = template.replaceAll(
      `{{Live Crawling Target URL}}`,
      `{{LIVE_CRAWLING_TARGET_URL}}`,
    )
    template = template.replaceAll(
      `{{Live Crawling Crawled Text}}`,
      `{{LIVE_CRAWLING_CRAWLED_TEXT}}`,
    )
    // 获取live crawling的内容
    specialActions.push({
      type: 'GET_CONTENTS_OF_URL',
      parameters: {
        URLActionURL: '{{LIVE_CRAWLING_TARGET_URL}}',
      },
    })
    specialActions.push({
      type: 'SET_VARIABLE',
      parameters: {
        VariableName: 'LIVE_CRAWLING_CRAWLED_TEXT',
      },
    })
  }
  // 获取web search的内容
  if (promptLibraryCard.variable_types?.includes('websearch')) {
    // 替换模板里面的变量
    template = template.replaceAll(
      `{{Web Search Query}}`,
      `{{WEB_SEARCH_QUERY}}`,
    )
    template = template.replaceAll(
      `{{Web Search Results}}`,
      `{{WEB_SEARCH_RESULTS}}`,
    )
    isOriginalMessage = true
    systemVariables.push(PRESET_VARIABLE_MAP.WEB_SEARCH_QUERY)
    const searchWithAIActions: ISetActionsType = [
      {
        type: 'CHAT_MESSAGE',
        parameters: {
          ActionChatMessageOperationType: 'add',
          ActionChatMessageConfig: {
            type: 'ai',
            text: '',
            originalMessage: {
              metadata: {
                shareType: 'search',
                title: {
                  title: `{{WEB_SEARCH_QUERY}}`,
                },
                copilot: {
                  title: {
                    title: 'Quick search',
                    titleIcon: 'Bolt',
                    titleIconSize: 24,
                  },
                  steps: [
                    {
                      title: 'Searching web',
                      status: 'loading',
                      icon: 'Search',
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
        type: 'GET_CONTENTS_OF_SEARCH_ENGINE',
        parameters: {
          URLSearchEngine: 'google',
          URLSearchEngineParams: {
            q: `{{WEB_SEARCH_QUERY}}`,
            region: '',
            limit: '6',
            btf: '',
            nojs: '1',
            ei: 'UTF-8',
            site: '',
            csp: '1',
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
                      title: 'Searching web',
                      status: 'complete',
                      icon: 'Search',
                      valueType: 'tags',
                      value: '{{WEB_SEARCH_QUERY}}',
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
          VariableName: 'WEB_SEARCH_RESULTS',
        },
      },
    ]
    specialActions.push(...searchWithAIActions)
  }
  if (
    customVariables.length > 0 ||
    systemVariables.filter(
      (systemVariable) => systemVariable.valueType !== 'Select',
    ).length > 0
  ) {
    template = template.replaceAll(
      `{{TARGET_LANGUAGE}}`,
      `{{AI_RESPONSE_LANGUAGE}}`,
    )
    template = template.replaceAll(`{{TONE}}`, `{{AI_RESPONSE_TONE}}`)
    template = template.replaceAll(
      `{{WRITTINGSTYLE}}`,
      `{{AI_RESPONSE_WRITING_STYLE}}`,
    )
    // 说明需要Set Variables Model
    // 追加默认的三个系统变量: Language\Tone\Writing style
    if (!variableMap.get('AI_RESPONSE_LANGUAGE')) {
      systemVariables.push({
        VariableName: 'AI_RESPONSE_LANGUAGE',
        defaultValue: 'English',
        systemVariable: true,
        valueType: 'Select',
        label: 'AI Response language',
      })
    }
    if (!variableMap.get('AI_RESPONSE_TONE')) {
      systemVariables.push({
        VariableName: 'AI_RESPONSE_TONE',
        defaultValue: 'Default',
        systemVariable: true,
        valueType: 'Select',
        label: 'Tone',
      })
    }
    if (!variableMap.get('AI_RESPONSE_WRITING_STYLE')) {
      systemVariables.push({
        VariableName: 'AI_RESPONSE_WRITING_STYLE',
        defaultValue: 'Default',
        systemVariable: true,
        valueType: 'Select',
        label: 'Writing style',
      })
    }
    actions.push({
      type: 'SET_VARIABLES_MODAL',
      parameters: {
        SetVariablesModalConfig: {
          template,
          contextMenuId: uuidV4(),
          title: promptLibraryCard.prompt_title,
          modelKey: 'Sidebar',
          variables: customVariables,
          systemVariables,
          actions: specialActions,
          answerInsertMessageId: isOriginalMessage
            ? `{{AI_RESPONSE_MESSAGE_ID}}`
            : '',
        },
      },
    })
  } else {
    // 添加specialActions
    actions.push(...specialActions)
    actions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template,
      },
    })
  }
  console.log(template)
  return actions
}

export const actionsToPromptLibraryCardDetailData = (
  actions: ISetActionsType,
  promptLibraryCardDetailData?: IPromptLibraryCardDetailData,
): IPromptLibraryCardDetailData => {
  // 因为这个版本只有一个prompt template，所以html的内容一定在RENDER_TEMPLATE/ASK_CHATGPT/RENDER_CHATGPT_PROMPT/SET_VARIABLES_MODAL
  let prompt_template = ''
  const templateAction: ActionIdentifier[] = [
    'RENDER_TEMPLATE',
    'ASK_CHATGPT',
    'RENDER_CHATGPT_PROMPT',
    'SET_VARIABLES_MODAL',
  ]
  // 倒序查找
  for (let i = actions.length - 1; i >= 0; i--) {
    const action = actions[i]
    if (templateAction.includes(action.type)) {
      if (action.parameters.template) {
        prompt_template = action.parameters.template
      } else if (action.parameters.SetVariablesModalConfig?.template) {
        prompt_template = action.parameters.SetVariablesModalConfig.template
      }
    }
  }
  // 设置actions的Variable Map用
  const variablesMap = new Map<string, IActionSetVariable>()
  Object.values(PRESET_VARIABLE_MAP).forEach((presetVariable) => {
    if (prompt_template.indexOf(presetVariable.VariableName) > -1) {
      variablesMap.set(presetVariable.VariableName, presetVariable)
    }
  })
  actions.forEach((action) => {
    if (action.parameters.SetVariablesModalConfig?.variables) {
      action.parameters.SetVariablesModalConfig.variables.forEach((item) => {
        variablesMap.set(
          item.VariableName,
          mergeWithObject([variablesMap.get(item.VariableName), item]),
        )
      })
    }
    if (action.parameters.SetVariablesModalConfig?.systemVariables) {
      action.parameters.SetVariablesModalConfig.systemVariables.forEach(
        (item) => {
          variablesMap.set(
            item.VariableName,
            mergeWithObject([variablesMap.get(item.VariableName), item]),
          )
        },
      )
    }
  })
  const variables: IPromptLibraryCardDetailVariable[] = Array.from(
    variablesMap.values(),
  )
    .filter((variable) => !variable.systemVariable)
    .map((variable) => {
      if (variable.label) {
        // 把template转换一下
        prompt_template = prompt_template.replaceAll(
          `{{${variable.VariableName}}`,
          `{{${variable.label}}`,
        )
        return {
          name: variable.label,
          hint: variable.placeholder,
          type: 'text',
        }
      } else {
        return {
          name: variable.VariableName,
          hint: variable.placeholder,
          type: 'text',
        }
      }
    })
  const variable_types: IPromptLibraryCardDetailVariableType[] = []

  // 日期处理
  if (variablesMap.get('SYSTEM_CURRENT_DATE')) {
    variable_types.push('system')
    variables.push({
      hint: 'This variable will be automatically updated with the current date',
      name: 'System Current Date',
      type: 'system',
    })
  }
  // selected text 处理
  if (variablesMap.get('SELECTED_TEXT')) {
    variables.push({
      hint: 'The text you selected on the current page',
      name: 'SELECTED_TEXT',
      type: 'text',
    })
  }
  // live crawling 处理
  if (
    variablesMap.get('LIVE_CRAWLING_TARGET_URL') ||
    variablesMap.get('LIVE_CRAWLING_CRAWLED_TEXT')
  ) {
    variable_types.push('livecrawling')
    variables.push({
      hint: 'Enter the URL you wish to extract text from',
      name: 'Live Crawling Target URL',
      type: 'livecrawling',
    })
    variables.push({
      hint:
        'This variable will be automatically updated with text extracted from the target URL',
      name: 'Live Crawling Crawled Text',
      type: 'livecrawling',
    })
  }
  // WebSearch处理
  if (
    variablesMap.get('WEB_SEARCH_QUERY') ||
    variablesMap.get('WEB_SEARCH_RESULTS')
  ) {
    variable_types.push('livecrawling')
    variables.push({
      hint: 'Enter your search term',
      name: 'Web Search Query',
      type: 'websearch',
    })
    variables.push({
      hint:
        'This variable will be automatically updated with the search results',
      name: 'Web Search Results',
      type: 'websearch',
    })
  }
  const promptLibraryData: IPromptLibraryCardDetailData = mergeWithObject([
    {
      author: '',
      author_url: '',
      category: 'Other',
      favourite_cnt: 0,
      id: '',
      optional_prompt_template:
        'Please write in {{TONE}} tone, {{WRITTINGSTYLE}} writing style, using {{TARGET_LANGUAGE}}.',
      prompt_hint: '',
      prompt_template,
      prompt_title: '',
      teaser: '',
      type: 'private',
      update_time: '',
      use_case: 'Other',
      user_input:
        "{'target_language': {'type': 'option', 'default': 'English'}, 'prompt': {'type': 'string', 'default': ''}, 'tone': {'type': 'optional_type', 'default': ''}, 'writing_style': {'type': 'optional_type', 'default': ''}}",
      variable_types: [],
      variables: [],
    },
    promptLibraryCardDetailData,
    {
      prompt_template,
      variable_types,
      variables,
    },
  ])
  return promptLibraryData
}
