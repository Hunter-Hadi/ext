/**
 * 解析后端steaming返回的数据结构，并转换成parse message
 * 解析后的outputMessage保持和IAIResponseMessage一样的结构，大部分业务逻辑处理的时候直接deepMerge
 */
import { IMaxAIResponseStreamMessage } from '@/background/src/chat/UseChatGPTChat/types'
import { combinedPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IAIResponseOriginalMessage } from '@/features/indexed_db/conversations/models/Message'

export type IMaxAIResponseParserMessage = {
  type: 'error' | 'message'
  done: boolean
  error: string
  data: IMaxAIResponseOutputMessage
  tokenExpired?: boolean
}

export type IMaxAIResponseOutputMessage = {
  text: string
  conversationId: string
  originalMessage?: IAIResponseOriginalMessage
}

/**
 * 解析stream请求结果，目前某些接口会对多个接口进行整合，返回的数据以key区分不同数据
 * @param streamMessage
 * @param outputMessage
 * @param conversation
 */
export const maxAIRequestResponseStreamParser = (
  streamMessage: IMaxAIResponseStreamMessage | null,
  outputMessage: IMaxAIResponseOutputMessage,
  conversation?: IConversation,
): IMaxAIResponseParserMessage => {
  // if (streamMessage?.conversation_id) {}
  // 增强数据
  if (streamMessage?.streaming_status) {
    if (streamMessage.text !== undefined) {
      if (streamMessage.need_merge) {
        outputMessage.text += streamMessage.text
      } else {
        outputMessage.text = streamMessage.text
      }
      switch (streamMessage.streaming_status) {
        case 'start':
        case 'in_progress':
          // loading状态
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            content: {
              title: {
                titleIcon: 'Loading',
              } as any,
              contentType: 'text',
              text: outputMessage.text,
            },
          }
          break
        case 'complete':
          // TODO 这里设置空后续需要注意一下，对于不同类型的消息会显示不同的icon
          // 这样写会直接覆盖掉，目前没问题因为是只有summary的时候用到
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            content: {
              title: {
                titleIcon: '',
              } as any,
              contentType: 'text',
              text: outputMessage.text,
            },
          }
          break
      }
    }
    if (streamMessage.citations !== undefined) {
      switch (streamMessage.streaming_status) {
        case 'start':
        case 'in_progress':
          // loading状态
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              sourceCitations: streamMessage.citations,
            },
          }
          break
        case 'complete':
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              sourceCitations: streamMessage.citations,
            },
          }
          break
      }
    }
    if (streamMessage.related !== undefined) {
      const pageSummaryType = conversation?.meta.pageSummaryType
      switch (streamMessage.streaming_status) {
        case 'start':
        case 'in_progress':
          // loading状态
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive: {
                title: {
                  title: ' ',
                  titleIcon: 'Loading',
                },
                value: '',
              },
            },
          }
          break
        case 'complete': {
          // TODO 对于summary message没有related question时需要区分显示Ask AI anything about the page/email/PDF/video
          const relatedDive = {
            title: {
              title: 'Keep exploring',
              titleIcon: 'Layers',
            },
            type: 'related',
            value: streamMessage.related,
          } as const
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive: streamMessage.related?.length
                ? pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY'
                  ? [relatedDive]
                  : relatedDive
                : {
                    title: {
                      title: 'Deep dive',
                      titleIcon: 'TipsAndUpdates',
                    },
                    value: 'Ask AI anything about the page...',
                  },
            },
          }
          break
        }
      }
    }
  } else if (streamMessage?.text) {
    outputMessage.text += streamMessage.text
  }

  return {
    type: 'message',
    done: false,
    error: '',
    data: outputMessage,
  }
}

/**
 * 解析json请求结果，某些接口里会对多个接口进行整合，返回的数据以key区分不同数据
 * @param responseData
 * @param outputMessage
 * @param conversation
 */
export const maxAIRequestResponseJsonParser = (
  responseData: IMaxAIResponseStreamMessage,
  outputMessage: IMaxAIResponseOutputMessage,
  conversation?: IConversation,
): IMaxAIResponseParserMessage => {
  return {
    type: 'message',
    done: true,
    error: '',
    data: maxAIRequestResponseStreamParser(
      {
        ...responseData,
        need_merge: false,
        streaming_status: 'complete',
      },
      outputMessage,
      conversation,
    ).data,
  }
}

/**
 * 请求错误处理
 * @param error
 * @param conversationId
 * @param needParser 需不需JSON.parse
 */
export const maxAIRequestResponseErrorParser = (
  error: any,
  conversationId: string,
): IMaxAIResponseParserMessage => {
  let tokenExpired = false
  if (
    error?.message === 'BodyStreamBuffer was aborted' ||
    error?.message === 'The user aborted a request.'
  ) {
    return {
      type: 'error',
      error: 'manual aborted request.',
      done: true,
      data: { text: '', conversationId },
      tokenExpired,
    }
  }
  try {
    error = JSON.parse(error.message || error)
  } catch (e) {
    // parser error
  }

  try {
    // 需要重新登录
    if (error?.code === 401) {
      tokenExpired = true
    }
    // 判断是不是用量卡点的报错
    const apiResponseSceneType = combinedPermissionSceneType(
      error?.msg,
      error?.meta?.model_type,
    )
    if (apiResponseSceneType) {
      return {
        type: 'error',
        error: apiResponseSceneType,
        done: true,
        data: { text: '', conversationId },
        tokenExpired,
      }
    }
    return {
      done: true,
      type: 'error',
      error:
        error.message ||
        error.detail ||
        'Something went wrong, please try again. If this issue persists, contact us via email.',
      data: { text: '', conversationId },
      tokenExpired,
    }
  } catch (e) {
    console.error('MaxAI Response error', e)
    return {
      done: true,
      type: 'error',
      error:
        'Something went wrong, please try again. If this issue persists, contact us via email.',
      data: { text: '', conversationId },
      tokenExpired,
    }
  }
}
