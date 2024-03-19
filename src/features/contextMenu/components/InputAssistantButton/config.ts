import { SxProps } from '@mui/material/styles'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { InputAssistantButtonStyle } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import { I18nextKeysType } from '@/i18next'

import {
  type IInputAssistantButtonObserverData,
  InputAssistantButtonElementRouteMap,
} from './InputAssistantButtonManager'

export interface IInputAssistantButton {
  tooltip: I18nextKeysType
  buttonKey: IChromeExtensionButtonSettingKey
  permissionWrapperCardSceneType: PermissionWrapperCardSceneType
  InputAssistantBoxSx?: SxProps
  CTAButtonStyle?: InputAssistantButtonStyle
  DropdownButtonStyle?: InputAssistantButtonStyle
  onSelectionEffect?: (observerData: IInputAssistantButtonObserverData) => any
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
  enable: boolean | ((e: any) => boolean)
  rootSelectors: (string | string[])[]
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
  // 给root前面的兄弟节点添加的样式
  rootPreviousElementSiblingStyle?: string
  // 给root后面的兄弟节点添加的样式
  rootNextElementSiblingStyle?: string
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
  | 'reddit.com'

const InputAssistantButtonGroupConfig = {
  'mail.google.com': [
    {
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
    {
      enable: true,
      rootSelectors: ['.amn'],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: () => {
          const replyButton = document.querySelector('.amn')
            ?.firstElementChild as HTMLElement
          replyButton?.click()

          // [Need to figure: Opening sidebar will seize the focus]
          // setTimeout(() => {
          //   const replyTextarea = document.querySelector('div[contenteditable="true"]')
          //   replyTextarea?.focus();
          // })
        },
      },
      appendPosition: 4,
      CTAButtonStyle: {
        borderRadius: '18px',
        iconSize: 18,
        padding: '9px 27px',
        borderWidth: 0,
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        margin: '0 0 0 12px',
      },
    },
  ],
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
  'outlook.live.com': [
    {
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
    {
      enable: true,
      rootSelectors: ['.th6py'],
      rootParentDeep: 0,
      rootStyle: 'overflow: unset;',
      rootParentStyle: 'overflow: unset;',
      rootWrapperTagName: 'div',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: () => {
          const replyButton =
            document.querySelector<HTMLElement>('.th6py > button')
          replyButton?.click()
        },
      },
      appendPosition: 2,
      CTAButtonStyle: {
        padding: '6px 20px',
        borderWidth: 0,
        borderRadius: '4px',
      },
      InputAssistantBoxSx: {
        margin: '4px 0 0 12px',
      },
    },
  ],
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
  'twitter.com': [
    {
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
    {
      enable: () => {
        if (document.querySelector('div[data-testid="toolBar"]')) return false
        return true
      },
      rootSelectors: [
        'div[role="progressbar"] + div > div > div > div > div > div > div > div > div > div:not([data-testid="toolBar"]) > div > div[role="button"][data-testid="tweetButtonInline"]',
      ],
      rootParentDeep: 1,
      rootWrapperTagName: 'div',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: () => {
          const replyTextarea = document.querySelector(
            'div[role="button"][data-testid="tweetButtonInline"]',
          )?.parentElement?.firstElementChild as HTMLElement
          replyTextarea?.click()
        },
      },
      appendPosition: 1,
      CTAButtonStyle: {
        borderRadius: '18px',
        iconSize: 18,
        padding: '9px 23px',
        borderWidth: 0,
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        margin: '0 0 0 12px',
      },
    },
  ],
  'linkedin.com': [
    {
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
    {
      enable: (rootElement) => {
        const commentBox = rootElement.parentElement.querySelector(
          '.comments-comment-box',
        )
        const disableComment = rootElement.querySelector(
          'button[data-finite-scroll-hotkey="c"][disabled]',
        )
        if (commentBox || disableComment) {
          return false
        }
        return true
      },
      rootSelectors: ['.feed-shared-social-action-bar'],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'order: 1;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          inputAssistantButton?.parentNode?.parentNode
            ?.querySelector<HTMLElement>(
              'button[data-finite-scroll-hotkey="c"]',
            )
            ?.click()

          setTimeout(() => {
            inputAssistantButton?.parentElement?.remove()
          })
        },
      },
      appendPosition: 0,
      CTAButtonStyle: {
        padding: '11px 32px',
        iconSize: 26,
        borderRadius: '4px',
      },
      InputAssistantBoxSx: {
        width: 'max-content',
        borderRadius: '4px',
      },
    },
    {
      enable: true,
      rootSelectors: ['.comments-comment-social-bar'],
      rootParentDeep: 0,
      rootStyle: 'transform: translateX(-0.8rem);',
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'order: 1;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          inputAssistantButton?.parentNode?.parentNode
            ?.querySelector<HTMLElement>(
              'button.comments-comment-social-bar__reply-action-button',
            )
            ?.click()
        },
      },
      appendPosition: 0,
      CTAButtonStyle: {
        padding: '4px 10px',
        iconSize: 12,
        borderRadius: '4px',
      },
      InputAssistantBoxSx: {
        borderRadius: '4px',
        marginBottom: '-4px',
        transform: 'translateY(-2px)',
      },
    },
  ],
  'facebook.com': [{
    enable: true,
    rootSelectors: [
      'div > div > div > #focused-state-composer-submit > span > div > i',
      'form[method="POST"] div > span > div[aria-label="Emoji"]',
    ],
    rootParentStyle: 'padding: 0',
    rootPreviousElementSiblingStyle: 'padding-right:100px',
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
  }, {
    enable: (rootElement) => {
      const postFooter = findSelectorParent('div[data-visualcompletion="ignore-dynamic"] > div:nth-child(1)', rootElement)
      if (postFooter) {
        if ((postFooter.childElementCount === 3 && postFooter.children[1]?.querySelector('span[role="link"]'))) {
          return false
        }
        if (findSelectorParent('div > div > div > #focused-state-composer-submit > span > div > i', rootElement, 30)) {
          return false
        }
      }
      return true
    },
    rootSelectors: ['div[role="article"] div[data-visualcompletion="ignore-dynamic"] > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)'],
    rootParentDeep: 0,
    rootWrapperTagName: 'div',
    rootWrapperStyle: 'order: 1; flex: 1; padding: 6px 2px;',
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
      onSelectionEffect: ({ id: buttonId }) => {
        const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
        const inputAssistantButton =
          InputAssistantButtonElementRouteMap.get(
            inputAssistantButtonSelector,
          ) ||
          document.querySelector<HTMLButtonElement>(
            inputAssistantButtonSelector,
          )

        inputAssistantButton?.parentElement?.nextElementSibling?.nextElementSibling?.querySelector<HTMLElement>('[role="button"]')?.click()
      },
    },
    appendPosition: 0,
    CTAButtonStyle: {
      height: 'inherit',
      padding: 0,
      iconSize: 20,
      borderRadius: '4px',
    },
    InputAssistantBoxSx: {
      borderRadius: '4px',
    },
  }, {
    enable: (rootElement) => {
      
      return true
    },
    rootSelectors: ['div[role="article"][aria-label] > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)'],
    rootParentDeep: 0,
    rootStyle: 'position: relative;',
    rootWrapperTagName: 'div',
    rootWrapperStyle: 'position: absolute; top: 0; right: 0; transform: translateX(60%); z-index: 1;',
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
      onSelectionEffect: ({ id: buttonId }) => {
        const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
        const inputAssistantButton =
          InputAssistantButtonElementRouteMap.get(
            inputAssistantButtonSelector,
          ) ||
          document.querySelector<HTMLButtonElement>(
            inputAssistantButtonSelector,
          )
          
        findSelectorParent('div[role="article"][aria-label] ul[aria-hidden] > li:nth-child(3) [role="button"]', inputAssistantButton as HTMLElement)?.click();
      },
    },
    appendPosition: 0,
    CTAButtonStyle: {
      padding: '5px 4.5px',
      iconSize: 12,
      borderRadius: '24px',
    },
    InputAssistantBoxSx: {
      borderRadius: '24px',
    },
  }],
  'youtube.com': [
    {
      enable: true,
      rootSelectors: [
        'ytd-commentbox ytd-button-renderer button[aria-label="Reply"]',
        'ytd-commentbox ytd-button-renderer button[aria-label="Comment"]',
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
    {
      enable: (rootElement) => {
        const commentDialog =
          rootElement.parentElement.querySelector('#comment-dialog')
        if ((commentDialog as any).hidden || commentDialog.innerHTML === '') {
          return true
        }
        return false
      },
      rootSelectors: ['#simple-box #placeholder-area'],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootStyle: 'display: flex; align-items: center;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          inputAssistantButton?.parentNode?.parentNode
            ?.querySelector<HTMLElement>(
              'yt-formatted-string#simplebox-placeholder',
            )
            ?.click()

          setTimeout(() => {
            inputAssistantButton?.parentElement?.remove()
          })
        },
      },
      appendPosition: 2,
      CTAButtonStyle: {
        padding: '8px 18px',
        iconSize: 16,
        borderRadius: '18px',
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        marginLeft: '8px',
        marginBottom: '-12px',
        transform: 'translateY(-12px)',
      },
    },
    {
      enable: (rootElement) => {
        const replyDialog = rootElement.parentElement.nextElementSibling
        if (replyDialog.innerHTML === '' || (replyDialog as any).hidden) {
          return true
        }
        return false
      },
      rootSelectors: ['#reply-button-end'],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootStyle: 'display: flex; align-items: center;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          inputAssistantButton?.parentNode?.parentNode
            ?.querySelector<HTMLElement>('button[aria-label="Reply"]')
            ?.click()

          setTimeout(() => {
            const wrapperElement = inputAssistantButton?.parentElement
            wrapperElement?.parentElement?.removeChild(wrapperElement)
          })
        },
      },
      appendPosition: 2,
      CTAButtonStyle: {
        padding: '8px 18px',
        iconSize: 16,
        borderRadius: '18px',
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        marginLeft: '8px',
      },
    },
  ],
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
  'reddit.com': {
    enable: true,
    rootSelectors: [['shreddit-composer', 'div[slot="action-bar-right"]']],
    appendPosition: 2,
    rootParentDeep: 0,
    rootWrapperTagName: 'div',
    composeNewButton: {
      tooltip: 'client:input_assistant_button__compose_new__tooltip',
      buttonKey: 'inputAssistantComposeNewButton',
      permissionWrapperCardSceneType: 'REDDIT_COMPOSE_NEW_BUTTON',
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
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'REDDIT_COMPOSE_REPLY_BUTTON',
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
      },
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'REDDIT_REFINE_DRAFT_BUTTON',
    },
    CTAButtonStyle: {},
    DropdownButtonStyle: {},
    InputAssistantBoxSx: {},
  },
} as {
  [key in InputAssistantButtonGroupConfigHostType]:
    | IInputAssistantButtonGroupConfig
    | IInputAssistantButtonGroupConfig[]
}
export const InputAssistantButtonGroupConfigHostKeys = Object.keys(
  InputAssistantButtonGroupConfig,
) as InputAssistantButtonGroupConfigHostType[]

export default InputAssistantButtonGroupConfig
