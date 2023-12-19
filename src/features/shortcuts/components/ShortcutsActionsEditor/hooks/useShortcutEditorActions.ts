import { useRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import {
  IPresetVariableName,
  PRESET_VARIABLE_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { ShortcutActionEditorState } from '@/features/shortcuts/components/ShortcutsActionsEditor/store'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import {
  escapeHtml,
  htmlToTemplate,
  promptTemplateToHtml,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const variablesToVariableMap = (variables: IActionSetVariable[]) => {
  const variableMap = new Map<string, IActionSetVariable>()
  variables.forEach((item) => {
    variableMap.set(item.VariableName, item)
  })
  return variableMap
}

const useShortcutEditorActions = () => {
  const [shortcutActionEditor, setShortcutActionEditor] = useRecoilState(
    ShortcutActionEditorState,
  )

  const { isDarkMode } = useCustomTheme()
  const initActions = (actions: ISetActionsType) => {
    let editHTML = ''
    // 因为这个版本只有一个prompt template，所以html的内容一定在RENDER_TEMPLATE/ASK_CHATGPT/RENDER_CHATGPT_PROMPT/SET_VARIABLES_MODAL
    let originalTemplate = ''
    let enabledAIResponseLanguage = true
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
          originalTemplate = action.parameters.template
        } else if (action.parameters.SetVariablesModalConfig?.template) {
          originalTemplate = action.parameters.SetVariablesModalConfig.template
        }
        if (
          action.type === 'ASK_CHATGPT' &&
          action.parameters.AskChatGPTWithAIResponseLanguage === false
        ) {
          enabledAIResponseLanguage = false
        } else if (
          action.type === 'SET_VARIABLES_MODAL' &&
          action.parameters.SetVariablesModalConfig?.askChatGPTActionParameters
            ?.AskChatGPTWithAIResponseLanguage === false
        ) {
          enabledAIResponseLanguage = false
        }
      }
    }
    const variablesMap = new Map<string, IActionSetVariable>()
    Object.values(PRESET_VARIABLE_MAP).forEach((presetVariable) => {
      if (originalTemplate.indexOf(presetVariable.VariableName) > -1) {
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
    const variables = Array.from(variablesMap.values())
    // 如果找到了template，就把template中的变量替换成html
    if (originalTemplate) {
      editHTML = promptTemplateToHtml(
        escapeHtml(originalTemplate),
        variablesMap,
        isDarkMode,
      )
    }
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        enabledAIResponseLanguage,
        actions,
        editHTML,
        variables,
      }
    })
  }
  const updateEditHTML = (prevSaveHTML: string) => {
    const template = htmlToTemplate(prevSaveHTML)
    setShortcutActionEditor((prev) => {
      const editHTML = promptTemplateToHtml(
        escapeHtml(template),
        variablesToVariableMap(prev.variables),
        isDarkMode,
      )
      return {
        ...prev,
        editHTML,
      }
    })
  }
  const generateActions = (title: string): ISetActionsType => {
    const { editHTML, variables } = shortcutActionEditor
    const template = htmlToTemplate(editHTML)
    // 过滤出prompt里真正用到的variables
    const usedVariables = variables.filter((variable) => {
      // 在html中用到了
      return template.indexOf(variable.VariableName) > -1
    })
    // actions的处理
    const actions: ISetActionsType = []
    // 是否为Summary，search那种Message
    let isOriginalMessage = false
    const variableMap = new Map<IPresetVariableName, IActionSetVariable>()
    usedVariables.forEach((item) => {
      variableMap.set(item.VariableName as IPresetVariableName, item)
    })
    const customVariables: IActionSetVariable[] = usedVariables.filter(
      (variable) => !variable.systemVariable,
    )
    const systemVariables: IActionSetVariable[] = []
    // 因为有些变量是内置的，有些是通过Action产生的，所以这里先粗暴的统一处理
    if (variableMap.get('SELECTED_TEXT')) {
      systemVariables.push(PRESET_VARIABLE_MAP.SELECTED_TEXT)
    }
    if (
      variableMap.get('LIVE_CRAWLING_TARGET_URL') ||
      variableMap.get('LIVE_CRAWLING_CRAWLED_TEXT')
    ) {
      systemVariables.push(PRESET_VARIABLE_MAP.LIVE_CRAWLING_TARGET_URL)
    }
    if (
      variableMap.get('WEB_SEARCH_QUERY') ||
      variableMap.get('WEB_SEARCH_RESULTS')
    ) {
      systemVariables.push(PRESET_VARIABLE_MAP.WEB_SEARCH_QUERY)
    }
    // 执行一些需要运行的操作：Current Date, live crawling、web search
    const specialActions: ISetActionsType = []
    // 设置的日期
    if (variableMap.get('SYSTEM_CURRENT_DATE')) {
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
    if (variableMap.get('LIVE_CRAWLING_CRAWLED_TEXT')) {
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
    if (variableMap.get('WEB_SEARCH_RESULTS')) {
      isOriginalMessage = true
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
      // 说明需要Set Variables Model
      if (customVariables.length > 0) {
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
      }
      actions.push({
        type: 'SET_VARIABLES_MODAL',
        parameters: {
          SetVariablesModalConfig: {
            template,
            contextMenuId: uuidV4(),
            title: title,
            modelKey: 'Sidebar',
            variables: customVariables,
            systemVariables,
            actions: specialActions,
            answerInsertMessageId: isOriginalMessage
              ? `{{AI_RESPONSE_MESSAGE_ID}}`
              : '',
            askChatGPTActionParameters: {
              AskChatGPTWithAIResponseLanguage:
                shortcutActionEditor.enabledAIResponseLanguage,
            },
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
          AskChatGPTWithAIResponseLanguage:
            shortcutActionEditor.enabledAIResponseLanguage,
        },
      })
    }
    return actions
  }
  const toggleAIResponseLanguage = () => {
    setShortcutActionEditor((prev) => {
      const newValue = !prev.enabledAIResponseLanguage
      return {
        ...prev,
        actions: prev.actions.map((action) => {
          if (action.type === 'ASK_CHATGPT') {
            action.parameters.AskChatGPTWithAIResponseLanguage = newValue
          }
          return action
        }),
        enabledAIResponseLanguage: newValue,
      }
    })
  }
  return {
    generateActions,
    actions: shortcutActionEditor.actions,
    setActions: initActions,
    editHTML: shortcutActionEditor.editHTML,
    updateEditHTML,
    variables: shortcutActionEditor.variables,
    enabledAIResponseLanguage: shortcutActionEditor.enabledAIResponseLanguage,
    toggleAIResponseLanguage,
  }
}

export default useShortcutEditorActions
