import { I18nextKeysType } from '@/i18next'
import { IOptionType } from '@/components/select/BaseSelect'
import { ISystemVariableSelectKey } from '@/features/shortcuts/components/SystemVariableSelect'

export type IActionSetVariablesValueType = 'Select' | 'Text'

export interface IActionSetVariables {
  label: string
  VariableName: string
  valueType: IActionSetVariablesValueType
  i18nKey?: I18nextKeysType
  defaultValue?: string
  options?: IOptionType[]
  placeholder?: string
  hidden?: boolean
}
export interface IActionSetSystemVariables {
  VariableName: ISystemVariableSelectKey
  defaultValue?: string
  label?: string
  placeholder?: string
  hidden?: boolean
}

export type IActionSetVariablesData = IActionSetVariables[]
export type IActionSetSystemVariablesData = IActionSetSystemVariables[]
