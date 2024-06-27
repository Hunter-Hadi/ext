import { IMaxAIResponseStreamMessage } from '@/background/src/chat/UseChatGPTChat/types'
import { IAIResponseOriginalMessage } from '@/features/indexed_db/conversations/models/Message'

// export type IMaxAIResponseParserMessage = Pick<
//   IChatMessage,
//   'text' | 'conversationId' | 'originalMessage'
// >

export type IMaxAIResponseParserMessage = {
  text: string
  conversationId: string
  originalMessage?: IAIResponseOriginalMessage
}

/**
 * 解析stream请求结果，目前某些接口会对多个接口进行整合，返回的数据以key区分不同数据
 * @param streamMessage
 * @param outputMessage
 */
export const maxAIRequestResponseStreamParser = (
  streamMessage: IMaxAIResponseStreamMessage | null,
  outputMessage: IMaxAIResponseParserMessage,
) => {
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
        case 'complete':
          // TODO 对于summary message没有related question时需要区分显示Ask AI anything about the page/email/PDF/video
          // 目前对于streaming返回的多种消息还没有一种机制能在shortcuts action里拿到
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive: streamMessage.related?.length
                ? {
                    title: {
                      title: 'Keep exploring',
                      titleIcon: 'Layers',
                    },
                    type: 'related',
                    value: streamMessage.related,
                  }
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
  } else if (streamMessage?.text) {
    outputMessage.text += streamMessage.text
  }

  return outputMessage
}

/**
 * 解析json请求结果，某些接口里会对多个接口进行整合，返回的数据以key区分不同数据
 * @param responseData
 * @param outputMessage
 */
export const maxAIRequestResponseJsonParser = (
  responseData: IMaxAIResponseStreamMessage,
  outputMessage: IMaxAIResponseParserMessage,
) => {
  return maxAIRequestResponseStreamParser(
    {
      ...responseData,
      need_merge: false,
      streaming_status: 'complete',
    },
    outputMessage,
  )
}
