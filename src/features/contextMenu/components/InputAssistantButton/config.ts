import { SxProps } from '@mui/material/styles'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { InputAssistantButtonStyle } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import { I18nextKeysType } from '@/i18next'

export interface IInputAssistantButton {
  tooltip: I18nextKeysType
  buttonKey: IChromeExtensionButtonSettingKey
  permissionWrapperCardSceneType: PermissionWrapperCardSceneType
}
export type IInputAssistantButtonKeyType =
  | 'composeNewButton'
  | 'composeReplyButton'
  | 'refineDraftButton'

interface IInputAssistantButtonGroupConfigBase {
  composeNewButton: IInputAssistantButton
  composeReplyButton: IInputAssistantButton
  refineDraftButton: IInputAssistantButton
}
export interface IInputAssistantButtonGroupConfig
  extends IInputAssistantButtonGroupConfigBase {
  rootSelector: string
  rootWrapperTagName: string
  appendPosition: number
  InputAssistantBoxStyle?: SxProps
  CTAButtonStyle?: InputAssistantButtonStyle
  DropdownButtonStyle?: InputAssistantButtonStyle
}

const IInputAssistantButtonGroupConfig = {
  'mail.google.com': {
    rootSelector: '.btC',
    rootWrapperTagName: 'td',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__quick_compose__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'GMAIL_DRAFT_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__quick_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__edit_or_review_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'GMAIL_CONTEXT_MENU',
    },
    appendPosition: 1,
    InputAssistantBoxStyle: {
      margin: '0 0 0 12px',
    },
  },
} as {
  [key in string]: IInputAssistantButtonGroupConfig
}

export default IInputAssistantButtonGroupConfig
