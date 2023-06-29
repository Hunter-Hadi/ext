import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useEffect } from 'react'
const useInjectShortCutsRunTime = () => {
  const { setShortCuts, runShortCuts, loading } =
    useShortCutsWithMessageChat('')
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
            if (loading) {
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
              await setShortCuts(actions)
              await runShortCuts(true)
              window.postMessage(
                {
                  id: 'USECHATGPT_WEB_INJECT_RESPONSE',
                  type: 'runShortCutActionsResponse',
                  taskId,
                  data: {
                    success: true,
                    error: '',
                  },
                },
                event.origin,
              )
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
