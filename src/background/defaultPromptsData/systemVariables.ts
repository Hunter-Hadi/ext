import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

export const VARIABLE_SELECTED_TEXT: IActionSetVariable = {
  label: 'Selected text',
  VariableName: 'SELECTED_TEXT',
  valueType: 'Text',
}

export const VARIABLE_CURRENT_WEBSITE_DOMAIN: IActionSetVariable = {
  label: 'The domain of the current website',
  VariableName: 'CURRENT_WEBSITE_DOMAIN',
  valueType: 'Text',
  systemVariable: true,
  hidden: true,
}

export const VARIABLE_AI_RESPONSE_LANGUAGE: IActionSetVariable = {
  label: 'AI Response language',
  VariableName: 'AI_RESPONSE_LANGUAGE',
  defaultValue: 'English',
  valueType: 'Select',
  systemVariable: true,
}
export const VARIABLE_AI_RESPONSE_WRITING_STYLE: IActionSetVariable = {
  label: 'Writing style',
  VariableName: 'AI_RESPONSE_WRITING_STYLE',
  defaultValue: 'Default',
  valueType: 'Select',
  systemVariable: true,
}

export const VARIABLE_AI_RESPONSE_TONE: IActionSetVariable = {
  label: 'Tone',
  VariableName: 'AI_RESPONSE_TONE',
  defaultValue: 'Default',
  valueType: 'Select',
  systemVariable: true,
}

// output
export const OUTPUT_CHAT_COMPLETE: IActionSetVariable = {
  label: 'Chat complete',
  VariableName: 'ChatComplete',
  valueType: 'Text',
  systemVariable: true,
}
