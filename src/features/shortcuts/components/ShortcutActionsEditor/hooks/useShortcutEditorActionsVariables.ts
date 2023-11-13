import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import { useMemo } from 'react'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { I18nextKeysType } from '@/i18next'
import { useRecoilState } from 'recoil'
import { ShortcutActionEditorState } from '@/features/shortcuts/components/ShortcutActionsEditor/store'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { updateHtmlWithVariables } from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
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

  const setVariables = (newVariables: IActionSetVariable[]) => {
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        editHTML: updateHtmlWithVariables(
          prev.editHTML,
          // 因为VariableName是唯一的，所以可以直接用VariableName作为key
          variablesToMap(newVariables),
          isDarkMode,
        ),
        variables: newVariables,
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
      const label = (variable?.label || '').toLowerCase()
      const placeholder = variable.placeholder?.toLowerCase()
      return (
        !variable.systemVariable &&
        (variableName.includes(searchText) ||
          label.includes(searchText) ||
          placeholder?.includes(searchText))
      )
    })
  }, [shortcutActionEditor.variables, filterValue])
  const systemSelectVisible = useMemo(() => {
    return (
      shortcutActionEditor.variables.filter(
        (variable) => variable.systemVariable,
      ).length >= 3
    )
  }, [shortcutActionEditor.variables])
  const toggleSystemSelectVisible = () => {
    if (systemSelectVisible) {
      // 过滤掉系统变量
      setVariables(
        shortcutActionEditor.variables.filter(
          (variable) => !variable.systemVariable,
        ),
      )
    } else {
      // 添加系统变量
      const systemSelect: IActionSetVariable[] = [
        {
          VariableName: 'AI_RESPONSE_LANGUAGE',
          defaultValue: 'English',
          systemVariable: true,
          valueType: 'Select',
          label: 'AI Response language',
        },
        {
          VariableName: 'AI_RESPONSE_TONE',
          defaultValue: 'Default',
          systemVariable: true,
          valueType: 'Select',
          label: 'Tone',
        },
        {
          VariableName: 'AI_RESPONSE_WRITING_STYLE',
          defaultValue: 'Default',
          systemVariable: true,
          valueType: 'Select',
          label: 'Writing style',
        },
      ]
      setVariables(shortcutActionEditor.variables.concat(systemSelect))
    }
  }
  return {
    addVariable,
    updateVariable,
    filterVariables,
    setVariables,
    variableMap,
    variables: shortcutActionEditor.variables,
    systemSelectVisible,
    toggleSystemSelectVisible,
  }
}

export default useShortcutEditorActionsVariables
