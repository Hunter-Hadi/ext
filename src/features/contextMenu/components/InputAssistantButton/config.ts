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
  enable: boolean
  rootSelector: string
  // 举例root还有多少层parent
  rootParentDeep: number
  rootWrapperTagName: string
  appendPosition: number
  // 给root添加的样式
  rootStyle?: string
  rootParentStyle?: string
  // 给root的parent添加的样式的层数
  rootParentStyleDeep?: number
  InputAssistantBoxStyle?: SxProps
  CTAButtonStyle?: InputAssistantButtonStyle
  DropdownButtonStyle?: InputAssistantButtonStyle
}

const IInputAssistantButtonGroupConfig = {
  'mail.google.com': {
    enable: true,
    rootSelector: '.btC',
    rootParentDeep: 0,
    rootWrapperTagName: 'td',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'GMAIL_DRAFT_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'GMAIL_CONTEXT_MENU',
    },
    appendPosition: 1,
    CTAButtonStyle: {
      borderRadius: '18px 0 0 18px',
      iconSize: 18,
      padding: '9px 12px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 18px 18px 0',
    },
    InputAssistantBoxStyle: {
      borderRadius: '18px',
      margin: '0 0 0 12px',
    },
  },
  'outlook.office.com': {
    enable: true,
    rootSelector: 'div[data-testid="ComposeSendButton"]',
    rootParentDeep: 1,
    rootStyle: 'overflow: unset;',
    rootParentStyle: 'overflow: unset;',
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'GMAIL_DRAFT_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'GMAIL_CONTEXT_MENU',
    },
    appendPosition: 1,
    CTAButtonStyle: {
      iconSize: 16,
      padding: '8px 20px',
    },
    DropdownButtonStyle: {
      padding: '6px',
    },
    InputAssistantBoxStyle: {
      margin: '0 0 0 12px',
    },
  },
  'outlook.live.com': {
    enable: true,
    rootSelector: 'div[data-testid="ComposeSendButton"]',
    rootParentDeep: 1,
    rootStyle: 'overflow: unset;',
    rootParentStyle: 'overflow: unset;',
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'GMAIL_DRAFT_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'GMAIL_CONTEXT_MENU',
    },
    appendPosition: 1,
    CTAButtonStyle: {
      padding: '6px 20px',
    },
    DropdownButtonStyle: {
      padding: '6px',
    },
    InputAssistantBoxStyle: {
      margin: '0 0 0 12px',
    },
  },
  'outlook.office365.com': {
    enable: true,
    rootSelector: 'div[data-testid="ComposeSendButton"]',
    rootParentDeep: 1,
    rootStyle: 'overflow: unset;',
    rootParentStyle: 'overflow: unset;',
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'OUTLOOK_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'OUTLOOK_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'OUTLOOK_REFINE_DRAFT_BUTTON',
    },
    appendPosition: 1,
    CTAButtonStyle: {
      padding: '6px 20px',
    },
    DropdownButtonStyle: {
      padding: '6px',
    },
    InputAssistantBoxStyle: {
      margin: '0 0 0 12px',
    },
  },
  'twitter.com': {
    enable: true,
    rootSelector: 'div[data-testid="toolBar"] > div:nth-child(2)',
    rootParentDeep: 0,
    rootParentStyleDeep: 4,
    rootParentStyle: 'z-index: 1001;',
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'TWITTER_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'TWITTER_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'TWITTER_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      iconSize: 16,
      borderRadius: '18px 0 0 18px',
      padding: '10px 9px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 18px 18px 0',
      padding: '8px 3px',
    },
    InputAssistantBoxStyle: {
      borderRadius: '18px',
    },
    appendPosition: 0,
  },
} as {
  [key in string]: IInputAssistantButtonGroupConfig
}

export default IInputAssistantButtonGroupConfig
