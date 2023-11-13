import { I18nextKeysType } from '@/i18next'
import { IOptionType } from '@/components/select/BaseSelect'

export type IActionSetVariablesValueType = 'Select' | 'Text'

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
}
