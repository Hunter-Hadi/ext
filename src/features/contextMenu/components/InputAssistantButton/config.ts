import { SxProps } from '@mui/material/styles'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { InputAssistantButtonStyle } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import { I18nextKeysType } from '@/i18next'

export interface IInputAssistantButton {
  tooltip: I18nextKeysType
  buttonKey: IChromeExtensionButtonSettingKey
  permissionWrapperCardSceneType: PermissionWrapperCardSceneType
  InputAssistantBoxSx?: SxProps
  CTAButtonStyle?: InputAssistantButtonStyle
  DropdownButtonStyle?: InputAssistantButtonStyle
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
  rootSelectors: string[]
  // 距离root还有多少层parent
  rootParentDeep: number
  // 渲染根节点的TagName
  rootWrapperTagName: string
  // 添加到root容器的第几个位置
  appendPosition: number
  // 给rootSelector添加的样式
  rootSelectorStyle?: string
  // 给root添加的样式
  rootStyle?: string
  // 给root的parent添加的样式
  rootParentStyle?: string
  // 给root的parent添加的样式的层数
  rootParentStyleDeep?: number
  // 给wrapper添加的样式
  rootWrapperStyle?: string
  InputAssistantBoxSx?: SxProps
  CTAButtonStyle?: InputAssistantButtonStyle
  DropdownButtonStyle?: InputAssistantButtonStyle
}

const IInputAssistantButtonGroupConfig = {
  'mail.google.com': {
    enable: true,
    rootSelectors: ['.btC'],
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
    InputAssistantBoxSx: {
      borderRadius: '18px',
      margin: '0 0 0 12px',
    },
  },
  'outlook.office.com': {
    enable: true,
    rootSelectors: ['div[data-testid="ComposeSendButton"]'],
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
    InputAssistantBoxSx: {
      margin: '0 0 0 12px',
    },
  },
  'outlook.live.com': {
    enable: true,
    rootSelectors: ['div[data-testid="ComposeSendButton"]'],
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
    InputAssistantBoxSx: {
      margin: '0 0 0 12px',
    },
  },
  'outlook.office365.com': {
    enable: true,
    rootSelectors: ['div[data-testid="ComposeSendButton"]'],
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
    InputAssistantBoxSx: {
      margin: '0 0 0 12px',
    },
  },
  'twitter.com': {
    enable: true,
    rootSelectors: [
      'div[data-testid="toolBar"] > div:nth-child(2) div[role="button"][data-testid]',
    ],
    rootSelectorStyle: 'order:2;',
    rootParentDeep: 1,
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
    InputAssistantBoxSx: {
      borderRadius: '18px',
      margin: '0 0 0 12px',
    },
    rootWrapperStyle: 'order :1;',
    appendPosition: 0,
  },
  'linkedin.com': {
    enable: true,
    rootSelectors: [
      '.comments-comment-box-comment__text-editor + div > div',
      '.share-box_actions .share-actions__primary-action',
    ],
    rootStyle: 'display:flex;alight-items:center;',
    appendPosition: 0,
    rootSelectorStyle: 'order:2;',
    rootParentDeep: 1,
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
      CTAButtonStyle: {
        padding: '2px 6px',
      },
      DropdownButtonStyle: {
        padding: '0px',
      },
      InputAssistantBoxSx: {
        marginTop: '6px',
      },
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'TWITTER_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      iconSize: 16,
      borderRadius: '16px 0 0 16px',
      padding: '8px 10px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 16px 16px 0',
      padding: '6px 3px',
    },
    InputAssistantBoxSx: {
      borderRadius: '16px',
      marginRight: '8px',
    },
  },
} as {
  [key in string]: IInputAssistantButtonGroupConfig
}

export default IInputAssistantButtonGroupConfig
