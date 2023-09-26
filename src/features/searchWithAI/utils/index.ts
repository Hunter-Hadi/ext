import { createClientMessageListener } from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import { ISearchPageKey } from './SearchPageAdapter'

export function endsWithQuestionMark(question: string) {
  return (
    question.endsWith('?') || // ASCII
    question.endsWith('？') || // Chinese/Japanese
    question.endsWith('؟') || // Arabic
    question.endsWith('⸮') // Arabic
  )
}

// search with ai 守护进程，为了保证 card 在 container 的第一个子元素
// 最简单的方案是，修改 sidebar container 为 flex，然后 card 为 order: -1
export function searchWithAIStyleReset(
  siteName: ISearchPageKey,
  container: HTMLElement,
) {
  switch (siteName) {
    case 'bing':
    case 'yandex': {
      container.style.display = 'inline-flex'
      container.style.flexDirection = 'column'
      break
    }
    case 'google':
    case 'baidu':
    case 'duckduckgo':
    case 'yahoo':
    case 'naver':
    case 'sogou':
    case 'brave': {
      container.style.display = 'flex'
      container.style.flexDirection = 'column'
      break
    }

    default: {
    }
  }
}

export const searchWithAIAskQuestion = async (
  question: {
    messageId: string
    parentMessageId: string
    conversationId: string
    question: string
  },
  options: IUserChatMessageExtraType,
  {
    onMessage,
    onError,
  }: {
    onMessage?: (answer: {
      messageId: string
      parentMessageId: string
      conversationId: string
      text: string
    }) => void
    onError?: (error: string) => void
  },
) => {
  return new Promise((resolve) => {
    const taskId = question.messageId
    const destroyListener = createClientMessageListener(async (event, data) => {
      if (
        event === 'Client_askChatGPTQuestionResponse' &&
        data.taskId === taskId
      ) {
        if (data.error) {
          onError?.(data.error)
        } else if (data?.data?.text) {
          onMessage?.(data.data)
        }
        if (data.done) {
          resolve(true)
          destroyListener()
          return {
            success: true,
            message: 'ok',
            data: {},
          }
        }
        return {
          success: true,
          message: 'ok',
          data: {},
        }
      }
      return undefined
    })
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    port.postMessage({
      event: 'SWAI_askAIQuestion',
      data: {
        taskId,
        question,
        options,
      },
    })
  })
}

export * from './SearchPageAdapter'
