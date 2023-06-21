import { useRecoilState, useSetRecoilState } from 'recoil'
import { useEffect, useRef } from 'react'
import { load, ComposeViewButtonOnClickEvent } from '@inboxsdk/core'
import {
  InboxSdkState,
  InboxThreadViewState,
  InboxComposeViewState,
  InboxEditState,
} from '@/features/gmail/store'
import { getComposeViewMessageId } from '@/features/gmail/utils'
import { v4 as uuidV4 } from 'uuid'
import {
  GmailToolBarDropdownIconBase64Data,
  GmailToolBarIconBase64Data,
} from '@/components/CustomIcon'
import { pingDaemonProcess } from '@/features/chatgpt'
import { hideChatBox } from '@/utils'
import { contextMenu } from 'react-contexify'
import {
  findFirstTierMenuHeight,
  getContextMenuRenderPosition,
} from '@/features/contextMenu/utils'
import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
  ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
} from '@/constants'
import { getChromeExtensionButtonContextMenu } from '@/background/utils'
import { useFocus } from '@/hooks/useFocus'
import useEffectOnce from '@/hooks/useEffectOnce'
import { getChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
const initComposeViewButtonStyle = () => {
  document
    .querySelectorAll('.usechatgpt-ai__gmail-toolbar-button--cta')
    .forEach((el) => {
      el.parentElement?.classList.add(
        'usechatgpt-ai__gmail-toolbar-button-wrapper--cta',
      )
    })
  document
    .querySelectorAll('.usechatgpt-ai__gmail-toolbar-button--dropdown')
    .forEach((el) => {
      el.parentElement?.classList.add(
        'usechatgpt-ai__gmail-toolbar-button-wrapper--dropdown',
      )
    })
}

const useInitInboxSdk = () => {
  const [inboxSdk, setInboxSdk] = useRecoilState(InboxSdkState)
  const setInboxThreadView = useSetRecoilState(InboxThreadViewState)
  const setComposeView = useSetRecoilState(InboxComposeViewState)
  const setInboxEditState = useSetRecoilState(InboxEditState)
  const gmailAssistantRef = useRef(false)
  useFocus(async () => {
    const gmailButtonSettings = await getChromeExtensionButtonSettings(
      'gmailButton',
    )
    const newValue =
      gmailButtonSettings?.visibility.whitelist.includes('mail.google.com') ||
      false
    const showRefreshConfirm = newValue !== gmailAssistantRef.current
    gmailAssistantRef.current = newValue
    // 如果设置了显示按钮，但是当前没有加载，那么刷新加载
    if (showRefreshConfirm) {
      window.confirm(
        "UseChatGPT.AI - Refresh this page to activate the updated settings for the 'Gmail assistant' button.",
      )
      // if (isConfirm) {
      //   window.location.reload()
      // }
    }
  })
  const timeoutRef = useRef(false)
  useEffectOnce(() => {
    getChromeExtensionButtonSettings('gmailButton').then(
      (gmailButtonSettings) => {
        const gmailAssistant =
          gmailButtonSettings?.visibility.whitelist.includes(
            'mail.google.com',
          ) || false
        gmailAssistantRef.current = gmailAssistant
        if (gmailAssistantRef.current) {
          load(2, 'sdk_UseChatGPT_AI_e063b66682', {}).then(async (sdk) => {
            console.log('inbox sdk loaded!')
            setInboxSdk({
              sdk,
              loading: false,
              initialized: false,
            })
          })
        }
      },
    )
  })
  useEffect(() => {
    if (!inboxSdk.initialized && !inboxSdk.loading && inboxSdk.sdk) {
      // 注册单个邮件对话列表生命周期
      inboxSdk.sdk.Conversations.registerThreadViewHandler((threadView) => {
        threadView.getThreadIDAsync().then((threadId) => {
          const proxyThreadView = {
            getInstance: () => {
              return threadView
            },
            currentThreadId: threadId,
          }
          setInboxThreadView(proxyThreadView)
        })
        threadView.on('destroy', () => {
          setInboxThreadView({
            getInstance: undefined,
            currentThreadId: undefined,
          })
          setInboxEditState({
            currentMessageId: undefined,
            currentDraftId: undefined,
          })
          hideChatBox()
        })
      })
      // 注册输入框生命周期方法
      inboxSdk.sdk.Compose.registerComposeViewHandler(async (composeView) => {
        console.log('registerComposeViewHandler', composeView)
        if (!gmailAssistantRef.current) {
          return
        }
        // draftId和currentDraftId都是在保存后才有
        // 一开始生成的时候只有ThreadID
        const currentDraftId = uuidV4()
        const isReplyComposeView = getComposeViewMessageId(
          composeView.getElement(),
        )
        console.log('currentDraftId', currentDraftId)
        timeoutRef.current = true
        composeView.addButton({
          title: 'UseChatGPT.AI',
          iconUrl: GmailToolBarDropdownIconBase64Data,
          iconClass: 'usechatgpt-ai__gmail-toolbar-button--dropdown',
          tooltip: 'More Gmail assistant options',
          orderHint: 2,
          onClick: async (event: ComposeViewButtonOnClickEvent) => {
            const newMessageId = getComposeViewMessageId(
              composeView.getElement(),
            )
            if (newMessageId) {
              setInboxEditState((prevState) => {
                return {
                  ...prevState,
                  currentDraftId,
                  currentMessageId: newMessageId,
                }
              })
            } else {
              setInboxEditState({
                currentDraftId,
                currentMessageId: `newDraft_${uuidV4()}`,
              })
            }
            const iconButtonBounce = event?.composeView
              ?.getElement()
              ?.querySelector('.usechatgpt-ai__gmail-toolbar-button--dropdown')
              ?.getBoundingClientRect()
            if (iconButtonBounce) {
              const gmailToolBarContextMenu =
                await getChromeExtensionButtonContextMenu('gmailButton')

              const options = gmailToolBarContextMenu.filter(
                (item) =>
                  item.id !== USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID &&
                  item.id !== USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
              )

              console.log('gmailButton', options)
              const itemHeight = Math.max(
                findFirstTierMenuHeight(options) || 0,
                0,
              )

              console.log('itemHeight', itemHeight)
              const { x, y } = getContextMenuRenderPosition(
                {
                  top: iconButtonBounce.top,
                  left: iconButtonBounce.left,
                  bottom: iconButtonBounce.bottom,
                  right: iconButtonBounce.right,
                },
                200,
                // itemHeight + padding + edit option height + Separator height + offset
                itemHeight + 12 + 33 + 6 + 6,
                {
                  offset: 8,
                  directions: ['top', 'right', 'left', 'bottom'],
                },
              )
              try {
                contextMenu.show({
                  id: ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
                  position: { x, y },
                  event: new MouseEvent('click'),
                })
              } catch (e) {
                console.log(e)
              }
            }
          },
        })
        composeView.addButton({
          title: 'UseChatGPT.AI',
          iconUrl: GmailToolBarIconBase64Data,
          iconClass: 'usechatgpt-ai__gmail-toolbar-button--cta',
          tooltip: isReplyComposeView
            ? 'Click this button to generate email reply'
            : 'Click this button to generate an entire email',
          orderHint: 1,
          onClick: async (event: ComposeViewButtonOnClickEvent) => {
            pingDaemonProcess()
            const newMessageId = getComposeViewMessageId(
              composeView.getElement(),
            )
            if (newMessageId) {
              setInboxEditState((prevState) => {
                return {
                  currentDraftId,
                  currentMessageId: newMessageId,
                  step: (prevState.step || 0) + 1,
                }
              })
            } else {
              setInboxEditState({
                currentDraftId,
                currentMessageId: `newDraft_${uuidV4()}`,
              })
            }
            const composeViewElement = composeView.getElement()
            const emailElement = composeViewElement.querySelector(
              '[contenteditable="true"]',
            ) as HTMLDivElement
            const range = document.createRange()
            range.selectNodeContents(emailElement)
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('ctaButtonClick', {
                  detail: {
                    range: range.cloneRange(),
                    emailElement,
                  },
                }),
              )
            }, 100)
          },
        })
        initComposeViewButtonStyle()
        // currentDraftId = (await composeView.getCurrentDraftID()) || ''
        const proxyComposeView = {
          getInstance: () => {
            return composeView
          },
        }
        // if (!currentDraftId) {
        //   currentDraftId = uuidV4()
        //   // 如果后续生成了draftId则会替换掉临时的uuid
        //   composeView.getDraftID().then((draftId) => {
        //     if (draftId) {
        //       const oldDraftId = currentDraftId
        //       console.log(
        //         '如果后续生成了draftId则会替换掉临时的uuid',
        //         oldDraftId,
        //       )
        //       setInboxEditState((prevState) => {
        //         console.log(prevState.currentDraftId)
        //         if (prevState.currentDraftId === oldDraftId) {
        //           return {
        //             ...prevState,
        //             currentDraftId: draftId,
        //           }
        //         } else {
        //           return {
        //             ...prevState,
        //           }
        //         }
        //       })
        //       setComposeView((prevState) => {
        //         const { [oldDraftId]: discard, ...rest } = prevState
        //         return {
        //           ...rest,
        //           [currentDraftId]: proxyComposeView,
        //         }
        //       })
        //     }
        //   })
        // }
        setComposeView((prevState) => {
          return {
            ...prevState,
            [currentDraftId]: proxyComposeView,
          }
        })
        // composeView
        //   .getElement()
        //   .addEventListener('click', async (event: Event) => {
        //     const messageId = getComposeViewMessageId(
        //       event.currentTarget as HTMLElement,
        //     )
        //     if (messageId) {
        //       console.log(messageId)
        //       setInboxThreadView((prevState) => {
        //         return {
        //           getInstance: prevState.getInstance,
        //         }
        //       })
        //       const draftId = await composeView.getCurrentDraftID()
        //       if (draftId) {
        //         setInboxEditState((prevState) => {
        //           return {
        //             currentDraftId: draftId,
        //             currentMessageId: messageId,
        //           }
        //         })
        //       } else {
        //         setInboxEditState((prevState) => {
        //           return {
        //             currentDraftId,
        //             currentMessageId: messageId,
        //           }
        //         })
        //       }
        //     }
        //   })
        // const newMessageId = getComposeViewMessageId(composeView.getElement())
        // if (newMessageId) {
        //   setInboxEditState((prevState) => {
        //     return {
        //       currentDraftId,
        //       currentMessageId: newMessageId,
        //     }
        //   })
        // }
        composeView.on('discard', () => {
          setTimeout(() => {
            setInboxEditState((prevState) => {
              if (prevState.currentDraftId === currentDraftId) {
                return {
                  currentMessageId: undefined,
                  currentDraftId: undefined,
                }
              } else {
                return {
                  ...prevState,
                }
              }
            })
            setComposeView((prevState) => {
              const { [currentDraftId]: discard, ...rest } = prevState
              return rest
            })
            hideChatBox()
          }, 0)
        })
        // composeView.on('destroy', () => {
        //   console.log('destroy')
        //   console.log(uuid)
        //   // setComposeView((prevState) => {
        //   //   const { [uuid]: discard, ...rest } = prevState
        //   //   return rest
        //   // })
        // })
        // ;[
        //   'destroy',
        //   // 'discard',
        //   'fullscreenChanged',
        //   'presending',
        //   'sendCanceled',
        //   'sending',
        //   'sent',
        //   'bodyChanged',
        //   'fromContactChanged',
        //   'recipientsChanged',
        //   'toContactAdded',
        //   'toContactRemoved',
        //   'ccContactAdded',
        //   'ccContactRemoved',
        //   'bccContactAdded',
        //   'bccContactRemoved',
        //   'minimized',
        //   'restored',
        //   'responseTypeChanged',
        // ].forEach((eventName) => {
        //   composeView.on(eventName, () => {
        //     console.log(eventName)
        //   })
        // })
      })
      // const routeId = inboxSdk.sdk.Router.getCurrentRouteView().getRouteID()
      // const routeParams = inboxSdk.sdk.Router.getCurrentRouteView().getParams()
      // setTimeout(() => {
      //   if (routeId) {
      //     inboxSdk?.sdk?.Router.goto(routeId, routeParams)
      //   }
      // }, 0)
    }
  }, [inboxSdk])
}
export default useInitInboxSdk
