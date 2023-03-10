import { useRecoilState, useSetRecoilState } from 'recoil'
import { useEffect, useRef } from 'react'
import * as InboxSDK from '@inboxsdk/core'
import { ComposeViewButtonOnClickEvent } from '@inboxsdk/core'
import {
  InboxSdkState,
  InboxThreadViewState,
  InboxComposeViewState,
  InboxEditState,
} from '../store'
import { getComposeViewMessageId } from '../utils'
import { v4 as uuidV4 } from 'uuid'
import {
  GmailToolBarDropdownIconBase64Data,
  GmailToolBarIconBase64Data,
} from '@/components/CustomIcon'
import { pingDaemonProcess } from '@/features/chatgpt'
import {
  getEzMailChromeExtensionSettings,
  hideEzMailBox,
  showEzMailBox,
} from '@/utils'
import { contextMenu } from 'react-contexify'
import { RangyGmailToolBarContextMenuId } from '@/features/contextMenu/components/RangyContextMenu'
import { getContextMenuRenderPosition } from '@/features/contextMenu/utils'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
const initComposeViewButtonStyle = () => {
  document
    .querySelectorAll('.ezmail-ai__gmail-toolbar-button--cta')
    .forEach((el) => {
      el.parentElement?.classList.add(
        'ezmail-ai__gmail-toolbar-button-wrapper--cta',
      )
    })
  document
    .querySelectorAll('.ezmail-ai__gmail-toolbar-button--dropdown')
    .forEach((el) => {
      el.parentElement?.classList.add(
        'ezmail-ai__gmail-toolbar-button-wrapper--dropdown',
      )
    })
}

const useInitInboxSdk = () => {
  const [inboxSdk, setInboxSdk] = useRecoilState(InboxSdkState)
  const setInboxThreadView = useSetRecoilState(InboxThreadViewState)
  const setComposeView = useSetRecoilState(InboxComposeViewState)
  const setInboxEditState = useSetRecoilState(InboxEditState)
  const timeoutRef = useRef(false)
  useEffect(() => {
    InboxSDK.load(2, 'sdk_test_email_fa89044171', {}).then((sdk) => {
      setInboxSdk({
        sdk,
        loading: false,
        initialized: false,
      })
    })
  }, [])
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
          hideEzMailBox()
        })
      })
      // 注册输入框生命周期方法
      inboxSdk.sdk.Compose.registerComposeViewHandler(async (composeView) => {
        console.log('registerComposeViewHandler', composeView)
        // draftId和currentDraftId都是在保存后才有
        // 一开始生成的时候只有ThreadID
        const currentDraftId = uuidV4()
        console.log('currentDraftId', currentDraftId)
        timeoutRef.current = true
        composeView.addButton({
          title: 'EzMail.AI – AI Email Drafter',
          iconUrl: GmailToolBarDropdownIconBase64Data,
          iconClass: 'ezmail-ai__gmail-toolbar-button--dropdown',
          tooltip:
            'Click this button to generate an entire email draft in seconds',
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
              ?.querySelector('.ezmail-ai__gmail-toolbar-button--dropdown')
              ?.getBoundingClientRect()
            if (iconButtonBounce) {
              const { gmailToolBarContextMenu } =
                await getEzMailChromeExtensionSettings()
              const options =
                gmailToolBarContextMenu || defaultGmailToolbarContextMenuJson
              const itemLength = options.length || 0
              const { x, y } = getContextMenuRenderPosition(
                {
                  top: iconButtonBounce.top,
                  left: iconButtonBounce.left,
                  bottom: iconButtonBounce.bottom,
                  right: iconButtonBounce.right,
                },
                200,
                32 * itemLength + 20,
                {
                  offset: 8,
                  directions: ['top', 'right', 'left', 'bottom'],
                },
              )
              try {
                contextMenu.show({
                  id: RangyGmailToolBarContextMenuId,
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
          title: 'EzMail.AI – AI Email Drafter',
          iconUrl: GmailToolBarIconBase64Data,
          iconClass: 'ezmail-ai__gmail-toolbar-button--cta',
          tooltip:
            'Click this button to access additional AI drafting options.',
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
            showEzMailBox()
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
            hideEzMailBox()
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
export { useInitInboxSdk }