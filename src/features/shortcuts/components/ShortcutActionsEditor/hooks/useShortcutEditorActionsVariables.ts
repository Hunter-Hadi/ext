import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import { useMemo } from 'react'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { I18nextKeysType } from '@/i18next'
import { useRecoilState } from 'recoil'
import { ShortcutActionEditorState } from '@/features/shortcuts/components/ShortcutActionsEditor/store'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { promptTemplateToHtml } from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
type stringKeyOfActionParameters = Extract<keyof ActionParameters, string>

export type IPresetVariablesItem = {
  // ActionParameters中的string类型的key
  VariableName: stringKeyOfActionParameters
  description: I18nextKeysType
  examples: I18nextKeysType[]
}

export const PRESET_VARIABLES_GROUP_MAP: {
  [key in string]: IPresetVariablesItem[]
} = {
  'prompt_editor:preset_variables__system__title': [
    {
      VariableName: 'SELECTED_TEXT',
      description:
        'prompt_editor:preset_variables__system__selected_text__description',
      examples: [
        'prompt_editor:preset_variables__system__selected_text__description__example1',
        'prompt_editor:preset_variables__system__selected_text__description__example2',
      ],
    },
    {
      VariableName: 'CURRENT_WEBSITE_DOMAIN',
      description:
        'prompt_editor:preset_variables__system__current_website_domain__description',
      examples: [
        'prompt_editor:preset_variables__system__current_website_domain__example1',
        'prompt_editor:preset_variables__system__current_website_domain__example2',
      ],
    },
  ],
}

const variablesToMap = (variables: IActionSetVariable[]) => {
  const map = new Map<string, IActionSetVariable>()
  variables.forEach((item) => {
    map.set(item.VariableName, item)
  })
  return map
}

const useShortcutEditorActionsVariables = (filterValue?: string) => {
  const { isDarkMode } = useCustomTheme()
  const [shortcutActionEditor, setShortcutActionEditor] = useRecoilState(
    ShortcutActionEditorState,
  )
  const variableMap = useMemo(() => {
    return variablesToMap(shortcutActionEditor.variables)
  }, [shortcutActionEditor.variables])

  const setVariables = (variables: IActionSetVariable[]) => {
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        editHTML: promptTemplateToHtml(
          prev.editHTML,
          variablesToMap(variables),
          isDarkMode,
        ),
        variables,
      }
    })
  }

  const addVariable = (variable: IActionSetVariable) => {
    setVariables([variable, ...shortcutActionEditor.variables])
  }
  const updateVariable = (variable: IActionSetVariable) => {
    setVariables(
      shortcutActionEditor.variables.map((item) => {
        if (item.VariableName === variable.VariableName) {
          return variable
        }
        return item
      }),
    )
  }
  const filterVariables = useMemo(() => {
    // 能模糊搜索的是label和VariableName和placeholder
    const searchText = filterValue?.toLowerCase()
    if (!searchText) {
      return shortcutActionEditor.variables
    }
    return shortcutActionEditor.variables.filter((variable) => {
      const variableName = variable.VariableName.toLowerCase()
      const label = variable.label.toLowerCase()
      const placeholder = variable.placeholder?.toLowerCase()
      return (
        variableName.includes(searchText) ||
        label.includes(searchText) ||
        placeholder?.includes(searchText)
      )
    })
  }, [shortcutActionEditor.variables, filterValue])
  return {
    addVariable,
    updateVariable,
    filterVariables,
    setVariables,
    variableMap,
    variables: shortcutActionEditor.variables,
  }
}

export default useShortcutEditorActionsVariables
