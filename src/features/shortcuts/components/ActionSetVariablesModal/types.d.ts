import { IOptionType } from '@/components/select/BaseSelect'
import { I18nextKeysType } from '@/i18next'

export type IActionSetVariablesValueType = 'Select' | 'Text'

export type IActionSetVariableValidateType = {
  required?: boolean
  pattern?: string
  message?: string
  maxLength?: number
  minLength?: number
  max?: number
  min?: number
}

export interface IActionSetVariable {
  VariableName: string
  valueType: IActionSetVariablesValueType
  label?: string
  defaultValue?: string
  description?: string
  i18nKey?: I18nextKeysType
  options?: IOptionType[]
  placeholder?: string
  hidden?: boolean
  systemVariable?: boolean
  validates?: IActionSetVariableValidateType[]
}
