import { SxProps } from '@mui/material/styles'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { InputAssistantButtonStyle } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import { I18nextKeysType } from '@/i18next'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'

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

export type InputAssistantButtonGroupConfigHostType =
  | 'mail.google.com'
  | 'outlook.office.com'
  | 'outlook.live.com'
  | 'outlook.office365.com'
  | 'twitter.com'
  | 'linkedin.com'
  | 'facebook.com'
  | 'youtube.com'
  | 'studio.youtube.com'

const InputAssistantButtonGroupConfig = {
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
    rootStyle: 'display:flex;align-items:center;',
    appendPosition: 0,
    rootParentDeep: 1,
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'LINKEDIN_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'LINKEDIN_COMPOSE_REPLY_BUTTON',
      CTAButtonStyle: {
        padding: '2px 6px',
      },
      DropdownButtonStyle: {
        padding: '0px',
      },
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'LINKEDIN_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      iconSize: 16,
      borderRadius: '16px 0 0 16px',
      padding: '8px 10px',
      transparentHeight: 6,
    },
    DropdownButtonStyle: {
      borderRadius: '0 16px 16px 0',
      padding: '6px 3px',
      transparentHeight: 6,
    },
    InputAssistantBoxSx: {
      borderRadius: '16px',
      marginRight: '8px',
    },
  },
  'facebook.com': {
    enable: true,
    rootSelectors: [
      'div > div > div > #focused-state-composer-submit > span > div > i',
      'form[method="POST"] div > span > div[aria-label="Emoji"]',
    ],
    rootParentStyle: 'padding: 0',
    rootStyle:
      'display: flex;align-items: center;flex-direction: row;padding: 0',
    appendPosition: 0,
    rootParentDeep: 5,
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'FACEBOOK_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'FACEBOOK_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'FACEBOOK_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      padding: '2px 6px',
      iconSize: 16,
      borderRadius: '16px 0 0 16px',
      transparentHeight: 6,
    },
    DropdownButtonStyle: {
      borderRadius: '0 16px 16px 0',
      padding: '0px',
      transparentHeight: 6,
    },
    InputAssistantBoxSx: {
      borderRadius: '16px',
      marginRight: '8px',
    },
  },
  'youtube.com': {
    enable: true,
    rootSelectors: [
      'ytd-commentbox ytd-button-renderer button.yt-spec-button-shape-next.yt-spec-button-shape-next--filled',
    ],
    rootStyle: '',
    appendPosition: 2,
    rootParentDeep: 3,
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'YOUTUBE_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      padding: '10px 9px',
      iconSize: 16,
      borderRadius: '18px 0 0 18px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 18px 18px 0',
      padding: '8px 3px',
    },
    InputAssistantBoxSx: {
      borderRadius: '18px',
      marginLeft: '8px',
    },
  },
  'studio.youtube.com': {
    enable: true,
    rootSelectors: ['ytcp-commentbox #submit-button'],
    appendPosition: 2,
    rootParentDeep: 2,
    rootStyle: 'display: flex;align-items: center;margin-top: 8px',
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'YOUTUBE_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {
      padding: '10px 9px',
      iconSize: 16,
      borderRadius: '18px 0 0 18px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 18px 18px 0',
      padding: '8px 3px',
    },
    InputAssistantBoxSx: {
      borderRadius: '18px',
      marginLeft: '8px',
    },
  },
  'instagram.com': {
    enable: true,
    rootSelectors: [
      'form textarea',
      'div:has( > div[contenteditable="true"]) + div > div:nth-child(1) > button > div',
      // TODO: Reels暂时不支持，因为展开sidebar会让Comments收起来
      // 'div:has( > div[contenteditable="true"]) + div > div:nth-child(1) > div',
    ],
    appendPosition: 1,
    rootParentDeep: 1,
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'YOUTUBE_REFINE_DRAFT_BUTTON',
    },
    rootWrapperStyle: 'order:2;margin-right: 8px;margin-left: 8px;',
    CTAButtonStyle: {
      padding: '5px 12px',
      iconSize: 14,
      borderRadius: '12px 0  0 12px',
    },
    DropdownButtonStyle: {
      borderRadius: '0 12px 12px 0',
      padding: '2px',
    },
    InputAssistantBoxSx: {
      borderRadius: '12px',
    },
  },
} as {
  [key in InputAssistantButtonGroupConfigHostType]: IInputAssistantButtonGroupConfig
}
export const InputAssistantButtonGroupConfigHostKeys = Object.keys(
  InputAssistantButtonGroupConfig,
) as InputAssistantButtonGroupConfigHostType[]

export default InputAssistantButtonGroupConfig
