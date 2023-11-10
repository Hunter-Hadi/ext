import { I18nextKeysType } from '@/i18next'
import { IOptionType } from '@/components/select/BaseSelect'
import { ISystemVariableSelectKey } from '@/features/shortcuts/components/SystemVariableSelect'

export type IActionSetVariablesValueType = 'Select' | 'Text'

export interface IActionSetVariable {
  label: string
  VariableName: string
  valueType: IActionSetVariablesValueType
  defaultValue?: string
  description?: string
  i18nKey?: I18nextKeysType
  options?: IOptionType[]
  placeholder?: string
  hidden?: boolean
  systemVariable?: boolean
}

export interface IActionSetSystemVariable {
  VariableName: ISystemVariableSelectKey
  defaultValue?: string
  label?: string
  description?: string
  placeholder?: string
  hidden?: boolean
}

export type IActionSetVariablesData = IActionSetVariable[]
export type IActionSetSystemVariablesData = IActionSetSystemVariable[]
