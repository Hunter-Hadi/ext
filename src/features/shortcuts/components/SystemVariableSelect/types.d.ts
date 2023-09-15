import { SxProps } from '@mui/material'

export type ISystemVariableSelectKey =
  | 'AI_RESPONSE_LANGUAGE'
  | 'AI_RESPONSE_TONE'
  | 'AI_RESPONSE_WRITING_STYLE'

export interface SystemVariableSelectProps {
  label?: string
  placeholder?: string
  defaultValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
}
