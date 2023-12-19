import { useEffect, useRef, useState } from 'react'

import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

/**
 * @deprecated - 被useInitWebPageMessageChannel代替
 */
const useInjectShortCutsRunTime = () => {
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
  const { setShortCuts, runShortCuts, loading } = useShortCutsWithMessageChat(
    '',
  )
  const isRunningActionsRef = useRef(false)
  useEffect(() => {
    if (
      waitRunActionsConfig.taskId &&
      currentSidebarConversationType === 'Chat' &&
      !isRunningActionsRef.current
    ) {
      isRunningActionsRef.current = true
      setShortCuts(waitRunActionsConfig.actions)
      runShortCuts()
        .then(() => {
          window.postMessage(
            {
              id: 'USECHATGPT_WEB_INJECT_RESPONSE',
              type: 'runShortCutActionsResponse',
              taskId: waitRunActionsConfig.taskId,
              data: {
                success: true,
                error: '',
              },
            },
            waitRunActionsConfig.origin,
          )
        })
        .catch((err) => () => {
          window.postMessage(
            {
              id: 'USECHATGPT_WEB_INJECT_RESPONSE',
              type: 'runShortCutActionsResponse',
              taskId: waitRunActionsConfig.taskId,
              data: {
                success: false,
                error: 'Network error.',
              },
            },
            waitRunActionsConfig.origin,
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

  // listen post message from html
  useEffect(() => {
    const listener = async (event: MessageEvent) => {
      if (event.data?.id === 'USECHATGPT_WEB_INJECT') {
        console.log('useInjectShortCutsRunTime', event.data)
        const { taskId, type, data } = event.data as any
        switch (type) {
          case 'ping':
            window.postMessage(
              {
                id: 'USECHATGPT_WEB_INJECT_RESPONSE',
                type: 'pong',
                taskId,
                data: {
                  success: true,
                },
              },
              event.origin,
            )
            break
          case 'runShortCutActions': {
            const { actions } = data
            if (isRunningActionsRef.current) {
              window.postMessage(
                {
                  id: 'USECHATGPT_WEB_INJECT_RESPONSE',
                  type: 'runShortCutActionsResponse',
                  taskId,
                  data: {
                    success: false,
                    error: 'shortcuts is running',
                  },
                },
                event.origin,
              )
            } else {
              updateSidebarConversationType('Chat')
              setWaitRunActionsConfig({
                origin: event.origin,
                taskId,
                actions,
              })
            }
            break
          }
        }
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [loading, setShortCuts, runShortCuts])
}
export default useInjectShortCutsRunTime
