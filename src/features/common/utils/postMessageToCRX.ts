import { MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID } from '@/features/common/constants'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export type MaxAIPostMessageWithWebPageType =
  | 'PING'
  | 'RUN_SHORTCUTS'
  | 'OPEN_URL'
  | 'OPEN_SIDEBAR'
  | 'CLOSE_SIDEBAR'

const postMessageToCRX = async <T>(
  win: Window,
  eventType: MaxAIPostMessageWithWebPageType,
  data: any,
  targetOrigin: string,
) => {
  return new Promise<T>((resolve) => {
    const taskId = Math.random().toString(36).slice(2)
    // 添加消息监听器
    const listener = (event: any) => {
      if (
        event.data.id === MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID &&
        event.data.taskId === taskId
      ) {
        // 解除消息监听器
        win.removeEventListener('message', listener)
        resolve(event.data?.data || event.data)
      }
    }
    // 添加消息监听器
    win.addEventListener('message', listener)
    // 发送消息
    win.postMessage(
      {
        data,
        taskId,
        eventType,
        id: MAXAI_POST_MESSAGE_WITH_WEB_PAGE_ID,
      },
      targetOrigin,
    )
  })
}

export const webPageOpenMaxAIImmersiveChat = () => {
  return postMessageToCRX(
    window,
    'OPEN_URL',
    {
      key: 'immersive_chat',
      query: '',
      active: true,
    },
    '*',
  )
}

export const webPageRunMaxAIShortcuts = (actions: ISetActionsType) => {
  return postMessageToCRX(
    window,
    'RUN_SHORTCUTS',
    {
      actions,
    },
    '*',
  )
}

export const webPageCloseSidebar = () => {
  return postMessageToCRX(window, 'CLOSE_SIDEBAR', {}, '*')
}
