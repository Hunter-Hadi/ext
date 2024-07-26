/**
 * 解析后端steaming返回的数据结构，并转换成parse message
 * 解析后的outputMessage保持和IAIResponseMessage一样的结构，大部分业务逻辑处理的时候直接deepMerge
 */

import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatGPTBackendBodyType,
  IMaxAIResponseStreamMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import { combinedPermissionSceneType } from '@/features/auth/utils/permissionHelper'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseOriginalMessage,
  IAIResponseOriginalMessageMetaDeep,
} from '@/features/indexed_db/conversations/models/Message'

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
 * 将streaming输出的时间戳文本转成格式化的结构
 * # [3:33] 大标题1
 * ## [2:22] 小标题11
 * ## [2:22] 小标题12
 *
 * # [3:33] 大标题2
 * ## [2:22] 小标题21
 * ## [2:22] 小标题22
 * 转换成
 * [{ text: '大标题1', start: '3:33', children: [ { text: '小标题11', start: '2:22' }, ... ] }, ...]
 * @param text
 */
const formatTimestampedMarkdown = (text: string) => {
  const result: IMaxAIResponseStreamMessage['timestamped'] = []

  // 按照两个换行符分组
  const groups = text.split('\n\n')

  groups.forEach((group) => {
    const lines = group.split('\n')
    let parent: Required<IMaxAIResponseStreamMessage>['timestamped'][number] = {
      start: '',
      text: '',
      children: [],
    }

    lines.forEach((line) => {
      const match = line.match(/(#+)\s*\[(.+?)\]\s*(.+)/)

      if (match) {
        const level = match[1].length === 1 ? 'parent' : 'child'
        const start = match[2]
        const text = match[3]

        if (level === 'parent') {
          parent = { text, start, children: [] }
          result.push(parent)
        } else if (level === 'child' && parent) {
          parent.children.push({ text, start })
        }
      }
    })
  })

  return result
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
  requestInfo?: {
    backendAPI?: IMaxAIChatGPTBackendAPIType
    postBody?: IMaxAIChatGPTBackendBodyType
  },
): IMaxAIResponseParserMessage => {
  const { backendAPI, postBody } = requestInfo || {}
  // if (streamMessage?.conversation_id) {}
  // 增强数据
  if (streamMessage?.streaming_status) {
    if (streamMessage.text !== undefined) {
      // summary下很大概率会返回```\n...\n```包裹的内容，markdown会渲染成code
      // 以及防止ai输出错误的格式，后端prompt指定```包裹的格式ai输出更稳定一些，前端先针对此文本做下过滤，
      if (postBody?.summary_type && streamMessage.text.match(/^```.*\n/)) {
        streamMessage.text = streamMessage.text.replace(/^```.*\n|\n```$/g, '')
      }
      // youtube时间线总结，转成结构化数据，后端不方便转，前端先自行转换成timestamped结构化的内容
      if (
        backendAPI === 'summary/v3/videosite' &&
        postBody?.summary_type === 'timestamped'
      ) {
        streamMessage.timestamped = formatTimestampedMarkdown(
          streamMessage.text,
        )
        // if (streamMessage.streaming_status === 'in_progress' && streamMessage.timestamped.length) {
        //   // 如果正在loading，删除最后一行，确保完整的一行输出完再展示
        //   const last = streamMessage.timestamped[streamMessage.timestamped.length - 1]
        //   if (!last.children.pop()) {
        //     streamMessage.timestamped.pop()
        //   }
        // }
        delete streamMessage.text
        return maxAIRequestResponseStreamParser(
          streamMessage,
          outputMessage,
          conversation,
          requestInfo,
        )
      }
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
          // 目前短文summary的时候会把整个上下文切片完返回
          // 完成的时候把没有用到的citation都过滤掉，不存储
          if (
            outputMessage.originalMessage?.metadata?.sourceCitations?.length
          ) {
            const pattern = /\[T(\d+)\]\(.*?\)/g
            const matches = [...outputMessage.text.matchAll(pattern)].map(
              (match) => match[1],
            )
            outputMessage.originalMessage.metadata.sourceCitations =
              outputMessage.originalMessage.metadata.sourceCitations.filter(
                (item) => {
                  return matches.includes(`${item.search_result_index}`)
                },
              )
          }

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
        case 'complete': {
          // TODO mock一下citations的功能，下面功能不要提交
          // const citations: IMaxAIResponseStreamMessage['citations'] = []
          // const pageContent = conversation?.meta.pageSummary?.content || ''
          // const totalLength = pageContent.length;
          // const numberOfSubstrings = 10;
          // for (let i = 0; i < numberOfSubstrings; i++) {
          //   // 随机生成一个长度在20到100之间的值
          //   const length = Math.floor(Math.random() * (100 - 20 + 1)) + 20;
          //
          //   // 随机生成一个起始索引，该索引加上截取长度不得超过字符串总长度
          //   const startIndex = Math.floor(Math.random() * (totalLength - length));
          //
          //   // 截取字符串并添加到结果数组中
          //   const substring = pageContent.substring(startIndex, startIndex + length);
          //   citations.push({
          //     snippet: '',
          //     content: substring,
          //     start_index: startIndex,
          //     length: startIndex + length,
          //   });
          // }
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              // sourceCitations: citations,
              sourceCitations: streamMessage.citations,
            },
          }
          break
        }
      }
    }
    if (streamMessage.timestamped !== undefined) {
      const value = streamMessage.timestamped.map((item, index) => ({
        id: `${index}`,
        start: item.start,
        duration: '',
        text: item.text,
        status: 'complete',
        children: item.children?.map((child, cIndex) => ({
          id: `${index}-${cIndex}`,
          start: child.start,
          duration: '',
          text: child.text,
          status: 'complete',
        })),
      }))
      switch (streamMessage.streaming_status) {
        case 'start':
        case 'in_progress': {
          // loading状态
          const timestampedDive: IAIResponseOriginalMessageMetaDeep = {
            type: 'timestampedSummary',
            title: {
              title: 'Summary',
              titleIcon: 'SummaryInfo',
            },
            value: [
              ...value,
              {
                id: `${value.length}`,
                start: '',
                duration: '',
                text: '',
                status: 'loading',
                children: [],
              },
            ],
          }
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive: ([] as IAIResponseOriginalMessageMetaDeep[])
                .concat(outputMessage.originalMessage?.metadata?.deepDive || [])
                .filter((item) => item && item.type !== timestampedDive.type)
                .concat(timestampedDive),
            },
          }
          break
        }
        case 'complete': {
          const timestampedDive: IAIResponseOriginalMessageMetaDeep = {
            type: 'timestampedSummary',
            title: {
              title: 'Summary',
              titleIcon: 'SummaryInfo',
            },
            value,
          }
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive: ([] as IAIResponseOriginalMessageMetaDeep[])
                .concat(outputMessage.originalMessage?.metadata?.deepDive || [])
                .filter((item) => item && item.type !== timestampedDive.type)
                .concat(timestampedDive),
            },
          }
          break
        }
      }
    }
    if (streamMessage.related !== undefined) {
      const pageSummaryType = conversation?.meta.pageSummaryType
      switch (streamMessage.streaming_status) {
        case 'start':
        case 'in_progress': {
          // loading状态
          const relatedDive: IAIResponseOriginalMessageMetaDeep = {
            type: 'related',
            title: {
              title: '',
              titleIcon: 'Loading',
            },
            value: [],
          }
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive:
                pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY'
                  ? ([] as IAIResponseOriginalMessageMetaDeep[])
                      .concat(
                        outputMessage.originalMessage?.metadata?.deepDive || [],
                      )
                      .filter((item) => item && item.type !== relatedDive.type)
                      .concat(relatedDive)
                  : relatedDive,
            },
          }
          break
        }
        case 'complete': {
          const relatedDive: IAIResponseOriginalMessageMetaDeep = streamMessage
            .related?.length
            ? {
                title: {
                  title: 'Keep exploring',
                  titleIcon: 'Layers',
                },
                type: 'related',
                value: streamMessage.related,
              }
            : {
                title: { title: '', titleIcon: '' },
                value: '',
              }
          outputMessage.originalMessage = {
            ...outputMessage.originalMessage,
            metadata: {
              ...outputMessage.originalMessage?.metadata,
              deepDive:
                pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY'
                  ? ([] as IAIResponseOriginalMessageMetaDeep[])
                      .concat(
                        outputMessage.originalMessage?.metadata?.deepDive || [],
                      )
                      .filter((item) => item && item.type !== relatedDive.type)
                      .concat(relatedDive)
                  : relatedDive,
              // pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY'
              //   ? ([relatedDive].filter(Boolean) as any)
              //   : relatedDive,
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
  requestInfo?: {
    backendAPI?: IMaxAIChatGPTBackendAPIType
    postBody?: IMaxAIChatGPTBackendBodyType
  },
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
      requestInfo,
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
