import { IActionSetVariablesData } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import { useState } from 'react'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { I18nextKeysType } from '@/i18next'

const DEFAULT_VARIABLES: IActionSetVariablesData = [
  {
    label: 'Output language',
    valueType: 'Select',
    VariableName: 'AI_RESPONSE_LANGUAGE',
    defaultValue: 'English',
  },
  {
    label: 'Tone',
    valueType: 'Select',
    VariableName: 'AI_RESPONSE_TONE',
    defaultValue: 'Default',
  },
  {
    label: 'Writing style',
    valueType: 'Select',
    VariableName: 'AI_RESPONSE_WRITING_STYLE',
    defaultValue: 'Default',
  },
]
type stringKeyOfActionParameters = Extract<keyof ActionParameters, string>

export type IPresetVariablesItem = {
  // ActionParameters中的string类型的key
  value: stringKeyOfActionParameters
  description: I18nextKeysType
  examples: I18nextKeysType[]
}

export const PRESET_VARIABLES_GROUP_MAP: {
  [key in string]: IPresetVariablesItem[]
} = {
  'prompt_editor:preset_variables__system__title': [
    {
      value: 'SELECTED_TEXT',
      description:
        'prompt_editor:preset_variables__system__selected_text__description',
      examples: [
        'prompt_editor:preset_variables__system__selected_text__description__example1',
        'prompt_editor:preset_variables__system__selected_text__description__example2',
      ],
    },
    {
      value: 'AI_RESPONSE_LANGUAGE',
      description:
        'prompt_editor:preset_variables__system__ai_response_language__description',
      examples: [
        'prompt_editor:preset_variables__system__ai_response_language__example1',
        'prompt_editor:preset_variables__system__ai_response_language__example2',
      ],
    },
    {
      value: 'CURRENT_WEBSITE_DOMAIN',
      description:
        'prompt_editor:preset_variables__system__current_website_domain__description',
      examples: [
        'prompt_editor:preset_variables__system__current_website_domain__example1',
        'prompt_editor:preset_variables__system__current_website_domain__example2',
      ],
    },
  ],
}

const useShortcutEditorActionVariables = () => {
  const [variables, setVariables] = useState<IActionSetVariablesData>(
    () => DEFAULT_VARIABLES,
  )
  return {
    variables,
    setVariables,
  }
}

export default useShortcutEditorActionVariables
