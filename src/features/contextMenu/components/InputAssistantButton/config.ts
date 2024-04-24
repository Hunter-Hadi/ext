import { SxProps } from '@mui/material/styles'
import { type TFunction } from 'i18next/index.v4'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { InputAssistantButtonStyle } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import { I18nextKeysType } from '@/i18next'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

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
  displayText?: string | ((t: TFunction<['client']>) => string)
  displayTextSx?: SxProps
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
  appendPosition?: number
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

export const EmailWebsites = [
  'mail.google.com',
  'outlook.office.com',
  'outlook.live.com',
  'outlook.office365.com',
] as const

export const SocialMediaWebsites = [
  'facebook.com',
  'twitter.com',
  'linkedin.com',
  'youtube.com',
  'studio.youtube.com',
  'instagram.com',
  'reddit.com',
] as const

export const ChatAppWebsites = [
  'web.whatsapp.com',
  'app.slack.com',
  'discord.com',
  'web.telegram.org',
] as const

export type EmailWebsitesType = (typeof EmailWebsites)[number]
export type SocialMediaWebsitesType = (typeof SocialMediaWebsites)[number]
export type ChatAppWebsitesType = (typeof ChatAppWebsites)[number]

export type WritingAssistantButtonGroupConfigHostType =
  | EmailWebsitesType
  | SocialMediaWebsitesType
  | ChatAppWebsitesType

const GmailWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
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
      rootWrapperStyle: 'order: 1;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton = (InputAssistantButtonElementRouteMap.get(
            inputAssistantButtonSelector,
          ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )) as HTMLElement

          if (inputAssistantButton) {
            const replyButton =
              findSelectorParent('.amn .ams.bkI', inputAssistantButton) ||
              findSelectorParent('.amn .ams.bkH', inputAssistantButton)

            replyButton?.click()

            // Need to figure: Opening sidebar will seize the focus
            // setTimeout(() => {
            //   const replyTextarea = findSelectorParent('div[contenteditable="true"]', inputAssistantButton)
            //   replyTextarea?.focus();
            // })
          }
        },
        displayText: (t) =>
          t('client:instant_reply_button__explicit__display_text'),
        displayTextSx: {
          ml: '8px',
        },
      },
      appendPosition: 0,
      CTAButtonStyle: {
        borderRadius: '18px',
        iconSize: 18,
        padding: '7.5px 16px 7.5px 12px',
        borderWidth: '0',
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        margin: '0 0 0 12px',
      },
    } as IInputAssistantButtonGroupConfig,
  ]

const OutlookWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
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
    {
      enable: (rootElement) => {
        const replyButtonDisabled = rootElement
          .querySelector('button')
          ?.getAttribute('disabled')
        if (replyButtonDisabled === '' || replyButtonDisabled) {
          return false
        }
        return true
      },
      rootSelectors: ['.th6py'],
      rootParentDeep: 0,
      rootStyle: 'overflow: unset;',
      rootParentStyle: 'overflow: unset;',
      rootWrapperStyle: 'order: 1;',
      rootWrapperTagName: 'div',
      appendPosition: 0,
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'OUTLOOK_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton = (InputAssistantButtonElementRouteMap.get(
            inputAssistantButtonSelector,
          ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )) as HTMLElement

          if (inputAssistantButton) {
            let replyButton = inputAssistantButton.parentElement
              ?.nextElementSibling as HTMLElement

            if (
              inputAssistantButton.parentElement?.parentElement
                ?.childElementCount === 4
            ) {
              replyButton = replyButton?.nextElementSibling as HTMLElement
            }

            replyButton?.click()
          }
        },
        displayText: (t) =>
          t('client:instant_reply_button__explicit__display_text'),
        displayTextSx: {
          ml: '6px',
        },
      },
      CTAButtonStyle: {
        padding: '5.5px 12px',
        borderWidth: 0,
        borderRadius: '4px',
      },
      InputAssistantBoxSx: {
        marginTop: '4px',
        marginLeft: '4px',
      },
    } as IInputAssistantButtonGroupConfig,
  ]

const TwitterWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
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
        if (document.querySelector('div[data-testid="toolBar"]')) {
          return false
        }
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
        permissionWrapperCardSceneType: 'TWITTER_COMPOSE_REPLY_BUTTON',
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
    } as any,
  ]

const LinkedInWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
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
      rootWrapperStyle: 'order:1;height:100%;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'LINKEDIN_COMPOSE_REPLY_BUTTON',
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
        height: 'inherit',
        padding: '0 20px',
        iconSize: 26,
        borderRadius: '4px',
      },
      InputAssistantBoxSx: {
        borderRadius: '4px',
      },
    } as IInputAssistantButtonGroupConfig,
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
        permissionWrapperCardSceneType: 'LINKEDIN_COMPOSE_REPLY_BUTTON',
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
    } as IInputAssistantButtonGroupConfig,
  ]

const FacebookWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
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
        padding: 0,
        transparentHeight: 6,
      },
      InputAssistantBoxSx: {
        borderRadius: '16px',
        marginRight: '8px',
      },
    },
    {
      enable: (rootElement) => {
        const postFooter = findSelectorParent(
          'div[data-visualcompletion="ignore-dynamic"] > div:nth-child(1)',
          rootElement,
        )
        if (postFooter) {
          if (
            postFooter.childElementCount === 3 &&
            postFooter.children[1]?.querySelector('span[role="link"]')
          ) {
            return false
          }
          if (
            findSelectorParent(
              'div > div > div > #focused-state-composer-submit > span > div > i',
              rootElement,
              5,
            )
          ) {
            return false
          }
        }
        return true
      },
      rootSelectors: [
        'div[role="article"] div[data-visualcompletion="ignore-dynamic"] > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)',
        'div[aria-describedby][aria-labelledby] div[data-visualcompletion="ignore-dynamic"] > div > div:nth-child(1) > div:nth-child(1) div:has(>div>div[aria-label][role="button"])',
      ],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'order: 1; flex: 1; padding: 6px 2px;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'FACEBOOK_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId, renderRootElement }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )
          const haveCommentsOnSurface = findSelectorParent(
            '[role="article"][aria-label]',
            renderRootElement,
          )

          if (haveCommentsOnSurface) {
            findSelectorParent(
              'form[role="presentation"] [data-visualcompletion="ignore"] [contenteditable="true"][role="textbox"]',
              renderRootElement,
              30,
            )?.click()
          } else {
            inputAssistantButton?.parentElement?.nextElementSibling?.nextElementSibling
              ?.querySelector<HTMLElement>('[role="button"]')
              ?.click()
          }
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
    } as IInputAssistantButtonGroupConfig,
    {
      enable: (rootElement) => {
        const commentContentBox = findSelectorParent(
          'span[lang][dir]',
          rootElement,
          3,
        )
        if (
          !commentContentBox ||
          (commentContentBox.innerText === '' &&
            commentContentBox.querySelector('img'))
        ) {
          return false
        }
        return true
      },
      rootSelectors: [
        'div[role="article"][aria-label] > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)',
      ],
      rootParentDeep: 0,
      rootStyle: 'position: relative;',
      rootWrapperTagName: 'div',
      rootWrapperStyle:
        'position: absolute; top: 0; right: 0; transform: translateX(60%); z-index: 1;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'FACEBOOK_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          findSelectorParent(
            'div[role="article"][aria-label] ul[aria-hidden] > li:nth-child(3) [role="button"]',
            inputAssistantButton as HTMLElement,
          )?.click()
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
    } as IInputAssistantButtonGroupConfig,
    // {
    //   enable: (rootElement) => {
    //     return true
    //   },
    //   rootSelectors: ['div:has(div>div[data-pagelet="Reels"]) + div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1):not([aria-label])'],
    //   rootParentDeep: 0,
    //   rootWrapperTagName: 'div',
    //   // rootWrapperStyle: 'position: absolute; top: 0; right: 0; transform: translateX(60%); z-index: 1;',
    //   composeReplyButton: {
    //     tooltip: 'client:input_assistant_button__compose_reply__tooltip',
    //     buttonKey: 'inputAssistantComposeReplyButton',
    //     permissionWrapperCardSceneType: 'GMAIL_REPLY_BUTTON',
    //     onSelectionEffect: ({ id: buttonId }) => {
    //       const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
    //       const inputAssistantButton =
    //         InputAssistantButtonElementRouteMap.get(
    //           inputAssistantButtonSelector,
    //         ) ||
    //         document.querySelector<HTMLButtonElement>(
    //           inputAssistantButtonSelector,
    //         )

    //       findSelectorParent('div[role="article"][aria-label] ul[aria-hidden] > li:nth-child(3) [role="button"]', inputAssistantButton as HTMLElement)?.click();
    //     },
    //   },
    //   appendPosition: 3,
    //   CTAButtonStyle: {
    //     width: 40,
    //     height: 40,
    //     padding: 0,
    //     iconSize: 20,
    //     borderRadius: '24px',
    //     alignSelf: 'center',
    //   },
    //   InputAssistantBoxSx: {
    //     alignItems: 'center',
    //     margin: '8px 0'
    //   },
    // }
  ]

const YouTubeWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: true,
      rootSelectors: ['ytd-commentbox ytd-button-renderer#submit-button'],
      rootStyle: '',
      appendPosition: 2,
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
        permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
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
    } as IInputAssistantButtonGroupConfig,
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
        permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
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
            ?.querySelector<HTMLElement>('button[aria-label]')
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
    } as IInputAssistantButtonGroupConfig,
  ]

const YouTubeStudioWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: true,
      rootSelectors: ['ytcp-commentbox #submit-button'],
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
        marginLeft: '24px',
      },
    },
    {
      enable: (rootElement) => {
        const commentDialog = findParentEqualSelector(
          'ytcp-comment',
          rootElement,
        )?.querySelector('#reply-dialog-container')
        if (commentDialog?.innerHTML === '') {
          return true
        }
        return false
      },
      rootSelectors: ['#toolbar:has(> #reply-button)'],
      rootParentDeep: 0,
      appendPosition: -1,
      rootWrapperTagName: 'div',
      rootStyle: 'display: flex; align-items: center;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'YOUTUBE_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          findSelectorParent(
            '#reply-button [role="button"]',
            inputAssistantButton as HTMLElement,
            2,
          )?.click()

          setTimeout(() => {
            inputAssistantButton?.parentElement?.remove()
          })
        },
      },
      CTAButtonStyle: {
        padding: '8px 16px',
        iconSize: 16,
        borderRadius: '18px',
      },
      InputAssistantBoxSx: {
        borderRadius: '18px',
        marginRight: '26px',
      },
    } as IInputAssistantButtonGroupConfig,
  ]

const RedditWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: true,
      rootSelectors: [
        'div[data-test-id="comment-submission-form-richtext"] + div button[type="submit"]',
        'hr + div > div > div > div:nth-child(1) button',
      ],
      rootSelectorStyle: 'order:2',
      rootWrapperStyle: 'order:1;',
      appendPosition: 1,
      rootParentDeep: 1,
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
      refineDraftButton: {
        tooltip: 'client:input_assistant_button__refine_draft__tooltip',
        buttonKey: 'inputAssistantRefineDraftButton',
        permissionWrapperCardSceneType: 'REDDIT_REFINE_DRAFT_BUTTON',
      },
      CTAButtonStyle: {},
      DropdownButtonStyle: {},
      InputAssistantBoxSx: {},
    },
    {
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
  ]

const DiscordWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: true,
      rootSelectors: [
        '[class^="channelTextArea"] :not([class*="innerDisabled"]) > [class^="buttons"]',
      ],
      appendPosition: 0,
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'display:flex;align-items:center;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'DISCORD_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          // it seems not to work
          if (inputAssistantButton) {
            findSelectorParent(
              '[class^="channelTextArea"] div[class^="textArea"]',
              inputAssistantButton as HTMLElement,
            )?.click()
          }
        },
      },
      refineDraftButton: {
        tooltip: 'client:input_assistant_button__refine_draft__tooltip',
        buttonKey: 'inputAssistantRefineDraftButton',
        permissionWrapperCardSceneType: 'DISCORD_REFINE_DRAFT_BUTTON',
      },
      CTAButtonStyle: {
        padding: '5px 8px',
        iconSize: 14,
        borderRadius: '12px 0  0 12px',
        margin: 'auto',
      },
      DropdownButtonStyle: {
        borderRadius: '0 12px 12px 0',
        padding: '2px 0',
      },
      InputAssistantBoxSx: {
        borderRadius: '12px',
        marginLeft: '8px',
        marginRight: '8px',
      },
    } as IInputAssistantButtonGroupConfig,
    {
      enable: (rootElement) => {
        if (
          !rootElement.querySelector(
            'svg > [d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"]',
          )
        ) {
          return false
        }
        return true
      },
      rootSelectors: [
        '[class^="buttonsInner"]:has(> div > svg > [d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"])',
      ],
      appendPosition: -1,
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'DISCORD_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )

          if (inputAssistantButton) {
            findSelectorParent(
              '[role=button]:has(> svg > [d="M2.3 7.3a1 1 0 0 0 0 1.4l5 5a1 1 0 0 0 1.4-1.4L5.42 9H11a7 7 0 0 1 7 7v4a1 1 0 1 0 2 0v-4a9 9 0 0 0-9-9H5.41l3.3-3.3a1 1 0 0 0-1.42-1.4l-5 5Z"])',
              inputAssistantButton as HTMLElement,
              3,
            )?.click()
          }
        },
      },
      rootWrapperStyle: 'height: 100%;',
      CTAButtonStyle: {
        height: '100%',
        borderRadius: 0,
        iconSize: 18,
        padding: '6.5px',
      },
      DropdownButtonStyle: {
        borderRadius: '0 12px 12px 0',
        padding: '2px',
      },
    } as IInputAssistantButtonGroupConfig,
  ]

const SlackWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: true,
      rootSelectors: [
        '.c-wysiwyg_container__footer[role="toolbar"] .c-wysiwyg_container__suffix',
      ],
      appendPosition: 0,
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'SLACK_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )
          if (inputAssistantButton) {
            findSelectorParent(
              '[data-qa="message_input"]',
              inputAssistantButton as HTMLElement,
            )?.click()
          }
        },
      },
      refineDraftButton: {
        tooltip: 'client:input_assistant_button__refine_draft__tooltip',
        buttonKey: 'inputAssistantRefineDraftButton',
        permissionWrapperCardSceneType: 'SLACK_REFINE_DRAFT_BUTTON',
      },
      CTAButtonStyle: {
        padding: '6px 8px',
        iconSize: 16,
        borderRadius: '4px 0 0 4px',
        margin: 'auto',
      },
      DropdownButtonStyle: {
        borderRadius: '0 4px 4px 0',
        padding: '4px 0',
      },
      InputAssistantBoxSx: {
        borderRadius: '4px',
        marginRight: '8px',
      },
    } as IInputAssistantButtonGroupConfig,
    // {
    //   enable: true,
    //   rootSelectors: [
    //     '[data-qa="message-actions"]:has(> [data-qa="start_thread"][aria-keyshortcuts="t"])',
    //   ],
    //   appendPosition: 5,
    //   rootParentDeep: 0,
    //   rootWrapperTagName: 'div',
    //   composeReplyButton: {
    //     tooltip: 'client:input_assistant_button__compose_reply__tooltip',
    //     buttonKey: 'inputAssistantComposeReplyButton',
    //     permissionWrapperCardSceneType: 'SLACK_COMPOSE_REPLY_BUTTON',
    //     onSelectionEffect: ({ id: buttonId }) => {},
    //   },
    //   rootWrapperStyle: 'height: 100%;',
    //   CTAButtonStyle: {
    //     height: '100%',
    //     borderRadius: '4px',
    //     iconSize: 16,
    //     padding: '8px',
    //   },
    // } as IInputAssistantButtonGroupConfig,
  ]

const WhatsAppWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: (rootElement) => {
        return (
          document.querySelectorAll(
            '#main [role="application"] [role="row"] > [data-id] .message-in',
          ).length > 0
        )
      },
      rootSelectors: [
        'footer .copyable-area div:has(> .lexical-rich-text-input)',
      ],
      appendPosition: 0,
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'order: 1; align-self: center;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'WHATSAPP_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )
          if (inputAssistantButton) {
            findSelectorParent(
              '[data-qa="message_input"]',
              inputAssistantButton as HTMLElement,
            )?.click()
          }
        },
      },
      refineDraftButton: {
        tooltip: 'client:input_assistant_button__refine_draft__tooltip',
        buttonKey: 'inputAssistantRefineDraftButton',
        permissionWrapperCardSceneType: 'WHATSAPP_REFINE_DRAFT_BUTTON',
      },
      CTAButtonStyle: {
        padding: '5px 6px',
        iconSize: 14,
        borderRadius: '8px 0 0 8px',
      },
      DropdownButtonStyle: {
        borderRadius: '0 8px 8px 0',
        padding: '2px 0',
      },
      InputAssistantBoxSx: {
        borderRadius: '8px',
        marginLeft: '8px',
      },
    } as IInputAssistantButtonGroupConfig,
    // {
    //   enable: () => {
    //     if (!document.querySelector('footer .copyable-area div:has(> button[aria-label] > [data-icon])')) {
    //       return false
    //     }
    //   }
    // }
  ]

const TelegramWritingAssistantButtonGroupConfigs: IInputAssistantButtonGroupConfig[] =
  [
    {
      enable: (rootElement) => {
        return Boolean(
          findParentEqualSelector(
            '.chats-container > .chat',
            rootElement,
          )?.querySelector(
            '.bubbles .scrollable > .bubbles-inner .bubbles-date-group .bubbles-group .bubble[data-peer-id].is-in',
          ),
        )
      },
      rootSelectors: ['.input-message-container'],
      rootParentDeep: 0,
      rootWrapperTagName: 'div',
      rootWrapperStyle: 'align-self: flex-end;',
      composeReplyButton: {
        tooltip: 'client:input_assistant_button__compose_reply__tooltip',
        buttonKey: 'inputAssistantComposeReplyButton',
        permissionWrapperCardSceneType: 'TELEGRAM_COMPOSE_REPLY_BUTTON',
        onSelectionEffect: ({ id: buttonId }) => {
          const inputAssistantButtonSelector = `[maxai-input-assistant-button-id="${buttonId}"]`
          const inputAssistantButton =
            InputAssistantButtonElementRouteMap.get(
              inputAssistantButtonSelector,
            ) ||
            document.querySelector<HTMLButtonElement>(
              inputAssistantButtonSelector,
            )
          if (inputAssistantButton) {
            findSelectorParent(
              '[data-qa="message_input"]',
              inputAssistantButton as HTMLElement,
            )?.click()
          }
        },
      },
      refineDraftButton: {
        tooltip: 'client:input_assistant_button__refine_draft__tooltip',
        buttonKey: 'inputAssistantRefineDraftButton',
        permissionWrapperCardSceneType: 'TELEGRAM_REFINE_DRAFT_BUTTON',
      },
      CTAButtonStyle: {
        padding: '5px 6px',
        iconSize: 14,
        borderRadius: '16px 0 0 16px',
      },
      DropdownButtonStyle: {
        borderRadius: '0 16px 16px 0',
        padding: '2px 0',
      },
      InputAssistantBoxSx: {
        borderRadius: '16px',
        marginInline: '.125rem',
        marginBlock: '10px',
      },
    } as IInputAssistantButtonGroupConfig,
  ]

const WritingAssistantButtonGroupConfigs: {
  [key in WritingAssistantButtonGroupConfigHostType]:
    | IInputAssistantButtonGroupConfig
    | IInputAssistantButtonGroupConfig[]
} = {
  'mail.google.com': GmailWritingAssistantButtonGroupConfigs,
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
  'outlook.live.com': OutlookWritingAssistantButtonGroupConfigs,
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
  'twitter.com': TwitterWritingAssistantButtonGroupConfigs,
  'linkedin.com': LinkedInWritingAssistantButtonGroupConfigs,
  'facebook.com': FacebookWritingAssistantButtonGroupConfigs,
  'youtube.com': YouTubeWritingAssistantButtonGroupConfigs,
  'studio.youtube.com': YouTubeStudioWritingAssistantButtonGroupConfigs,
  'instagram.com': {
    enable: true,
    rootSelectors: [
      'form textarea:not([id])',
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
      permissionWrapperCardSceneType: 'INSTAGRAM_COMPOSE_NEW_BUTTON',
    },
    composeReplyButton: {
      tooltip: 'client:input_assistant_button__compose_reply__tooltip',
      buttonKey: 'inputAssistantComposeReplyButton',
      permissionWrapperCardSceneType: 'INSTAGRAM_COMPOSE_REPLY_BUTTON',
    },
    refineDraftButton: {
      tooltip: 'client:input_assistant_button__refine_draft__tooltip',
      buttonKey: 'inputAssistantRefineDraftButton',
      permissionWrapperCardSceneType: 'INSTAGRAM_REFINE_DRAFT_BUTTON',
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
  'reddit.com': RedditWritingAssistantButtonGroupConfigs,
  'web.whatsapp.com': WhatsAppWritingAssistantButtonGroupConfigs,
  'app.slack.com': SlackWritingAssistantButtonGroupConfigs,
  'discord.com': DiscordWritingAssistantButtonGroupConfigs,
  'web.telegram.org': TelegramWritingAssistantButtonGroupConfigs,
}

export const InputAssistantButtonGroupConfigHostKeys = Object.keys(
  WritingAssistantButtonGroupConfigs,
) as WritingAssistantButtonGroupConfigHostType[]

export default WritingAssistantButtonGroupConfigs
