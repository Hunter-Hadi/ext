import { useEffect, useRef, useState } from 'react'

import { MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID } from '@/features/common/constants'
import { MaxAIPostMessageWithWebPageType } from '@/features/common/utils/postMessageToCRX'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuRootElement,
  hideChatBox,
  showChatBox,
} from '@/utils'

/**
 * 初始化和网页的通信，用来运行网页发送的shortcuts或者打开特定的网页
 */
const useInitWebPageMessageChannel = () => {
  const {
    updateSidebarConversationType,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const [waitRunActionsConfig, setWaitRunActionsConfig] = useState<{
    taskId: string
    actions: ISetActionsType
    origin: string
  }>({
    origin: '',
    taskId: '',
    actions: [],
  })
  const {
    setShortCuts,
    runShortCuts,
    shortCutsEngineRef,
  } = useShortCutsWithMessageChat('')
  const isRunningActionsRef = useRef(false)
  const responseDataToPage = (
    taskId: string,
    origin: string,
    data: {
      success: boolean
      message: string
      data: any
    },
  ) => {
    window.postMessage(
      {
        id: MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID,
        taskId,
        data,
      },
      origin,
    )
  }
  useEffect(() => {
    if (
      waitRunActionsConfig.taskId &&
      currentSidebarConversationType === 'Chat' &&
      !isRunningActionsRef.current
    ) {
      isRunningActionsRef.current = true
      setShortCuts(waitRunActionsConfig.actions)
      runShortCuts(true)
        .then((result) => {
          console.log(shortCutsEngineRef)
          responseDataToPage(
            waitRunActionsConfig.taskId,
            waitRunActionsConfig.origin,
            {
              success: true,
              data: null,
              message: 'ok',
            },
          )
        })
        .catch((err) => () => {
          responseDataToPage(
            waitRunActionsConfig.taskId,
            waitRunActionsConfig.origin,
            {
              success: false,
              data: null,
              message: 'Network error.',
            },
          )
        })
        .finally(() => {
          setWaitRunActionsConfig({
            taskId: '',
            actions: [],
            origin: '',
          })
          isRunningActionsRef.current = false
        })
    }
  }, [
    currentSidebarConversationType,
    waitRunActionsConfig,
    setShortCuts,
    runShortCuts,
  ])

  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      if (event.data?.id === MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID) {
        const { eventType, data, taskId } = event.data

        switch (eventType as MaxAIPostMessageWithWebPageType) {
          case 'PING': {
            responseDataToPage(taskId, event.origin, {
              success: true,
              message: 'ok',
              data: null,
            })
            return
          }
          case 'OPEN_URL': {
            if (data.key) {
              chromeExtensionClientOpenPage({
                key: data.key,
                query: data.query || undefined,
                active: data.active || false,
              })
              responseDataToPage(taskId, event.origin, {
                success: true,
                message: 'ok',
                data: null,
              })
            } else {
              responseDataToPage(taskId, event.origin, {
                success: false,
                message: 'key is required',
                data: null,
              })
            }
            return
          }
          case 'RUN_SHORTCUTS': {
            updateSidebarConversationType('Chat')
            setWaitRunActionsConfig({
              origin: event.origin,
              taskId,
              actions: data.actions || [],
            })
            return
          }
          case 'CLOSE_SIDEBAR': {
            const closeModalButton = getAppContextMenuRootElement()?.querySelector(
              '.max-ai__action__set_variables_modal button[data-test-id="close-modal-button"]',
            ) as HTMLButtonElement
            if (closeModalButton) {
              closeModalButton.click()
            }
            hideChatBox()
            return
          }
          case 'OPEN_SIDEBAR': {
            showChatBox()
          }
        }
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])
}
export default useInitWebPageMessageChannel
