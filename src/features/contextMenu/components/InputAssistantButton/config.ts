import { SxProps } from '@mui/material/styles'

export interface IInputAssistantButtonBaseConfig {
  rootSelector: string
  rootWrapperTagName: string
  appendPosition?: number
  InputAssistantBoxStyle?: SxProps
}
const inputAssistantButtonBaseConfig = {
  'mail.google.com': {
    rootSelector: '.btC',
    rootWrapperTagName: 'td',
    appendPosition: 1,
    InputAssistantBoxStyle: {
      margin: '0 0 0 12px',
    },
  },
} as {
  [key in string]: IInputAssistantButtonBaseConfig
}
export default inputAssistantButtonBaseConfig
