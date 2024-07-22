// 基于 chatgpt 3.5 的 token 限制
import cl100k_base, {
  EndOfPrompt,
} from 'gpt-tokenizer/esm/encoding/cl100k_base'

import { numberToTokensText } from '@/utils/dataHelper/numberHelper'
import { isMaxAIPage } from '@/utils/dataHelper/websiteHelper'
import { executeWebWorkerTask } from '@/utils/webWorkerClient'

export const MAX_CHARACTERS_TOKENS = 4096

// 切割字符的 缓冲值
export const SLICE_BUFFER = 0.8

/**
 * 估算每个单词的token
 * @deprecated 不应该再用了
 * @param text
 */
export const getEachWordToken = async (text: string) => {
  const length = text.length
  const tokens =
    (await executeWebWorkerTask<number[]>('WEB_WORKER_GET_TOKENS', text)) || []
  return length / tokens.length
}

/**
 * 根据token 计算后返回 slice end 的位置
 * @deprecated
 * @param text
 * @param tokenLimit
 * @param buffer
 * @param bufferValue
 */
export const getSliceEnd = async (
  text: string,
  tokenLimit?: number,
  buffer = true,
  bufferValue = SLICE_BUFFER,
) => {
  const eachWordToken = await getEachWordToken(text)
  const limit = tokenLimit || MAX_CHARACTERS_TOKENS
  const { length: textTokens } = await getTextTokens(text)

  if (textTokens <= limit) {
    return text.length
  }

  // 需要切割掉的length
  const sliceLength = Math.floor(eachWordToken * (textTokens - limit))
  let sliceEnd =
    text.length < sliceLength ? text.length : text.length - sliceLength

  if (buffer) {
    sliceEnd = Math.floor(sliceEnd * bufferValue)
  }
  return sliceEnd
}

const mergeArrays = <T>(...arrays: T[][]): T[] => {
  let totalLength = 0

  for (let i = 0; i < arrays.length; i++) {
    totalLength += arrays[i].length
  }

  const result: T[] = new Array(totalLength)
  let resultIndex = 0

  for (let i = 0; i < arrays.length; i++) {
    const currentArray = arrays[i]
    const currentLength = currentArray.length

    for (let j = 0; j < currentLength; j++) {
      result[resultIndex++] = currentArray[j]
    }
  }

  return result
}

export const getTextTokens = (text: string) => {
  try {
    const tokens = cl100k_base.encode(text, {
      allowedSpecial: new Set<string>([EndOfPrompt]),
    })
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
}

/**
 * 获取 text 的 token 值
 * @param text
 * @param options
 * @param options.tokenLimit - 超过限制的token数量
 */
export const getTextTokensWithRequestIdle = (
  text: string,
  options: {
    tokenLimit?: number
  } = {},
) => {
  const { tokenLimit = -1 } = options
  return new Promise<{
    tokens: number
    isLimit: boolean
  }>((resolve) => {
    let totalTokens = 0
    let index = 0
    const textOfChunks: string[] = []
    const CHUNKS_SIZE = 20000
    for (let i = 0; i < text.length; i += CHUNKS_SIZE) {
      textOfChunks.push(text.slice(i, i + CHUNKS_SIZE))
    }
    const totalChunks = textOfChunks.length
    console.log('getTextTokensWithRequestIdle textOfChunks count', totalChunks)

    const tokenizeChunk = (chunk: string) => {
      const tokens = getTextTokens(chunk)
      console.log(
        `getTextTokensWithRequestIdle progress [${(
          ((index + 1) / totalChunks) *
          100
        ).toFixed(2)}%] tokens ${numberToTokensText(totalTokens)}`,
      )
      totalTokens += tokens.length
      if (tokenLimit > 0 && totalTokens > tokenLimit) {
        // 清空剩余的textOfChunks, 提前结束
        textOfChunks.splice(0, textOfChunks.length)
        resolve({
          tokens: totalTokens,
          isLimit: true,
        })
      }
    }

    const processChunks = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && textOfChunks.length > 0) {
        tokenizeChunk(textOfChunks.shift() as string)
        index++
      }

      if (textOfChunks.length > 0) {
        requestIdleCallback(processChunks)
      } else {
        resolve({
          tokens: totalTokens,
          isLimit: false,
        })
      }
    }
    requestIdleCallback(processChunks, { timeout: 200 })
  })
}

/**
 * 获取 text 的 token 值
 * 因为web worker有启动时间，短文本不如直接用上面的getTextTokens
 * @param text
 * @param thread
 */
export const getTextTokensWithThread = async (text: string, thread: number) => {
  // NOTE: 太高会内存溢出
  const maxThread = Math.min(Math.max(thread, 1), 10)
  if (thread === 1 || !isMaxAIPage()) {
    return await getTextTokens(text)
  }
  const textOfChunks = []
  const chunkLength = Math.ceil(text.length / maxThread)
  for (let i = 0; i < maxThread; i++) {
    textOfChunks.push(text.slice(i * chunkLength, (i + 1) * chunkLength))
  }
  const textOfTokens = await Promise.all(
    textOfChunks.map(async (textOfChunk) => {
      return (
        ((await executeWebWorkerTask<number[]>(
          'WEB_WORKER_GET_TOKENS',
          textOfChunk,
        )) as number[]) || []
      )
    }),
  )
  return mergeArrays(...textOfTokens)
}

export const sliceTextByTokens = async (
  originalText: string,
  tokenLimit: number,
  options?: {
    thread?: number
    bufferTokens?: number
    startSliceRate?: number
    endSliceRate?: number
    startSlicePosition?: 'start' | 'end'
    partOfTextLength?: number
  },
) => {
  const {
    thread = 1,
    bufferTokens = 0,
    startSliceRate = 1,
    endSliceRate = 1,
    partOfTextLength = 1000,
    startSlicePosition = 'end',
  } = options || {}
  if (
    (
      await getTextTokensWithThread(
        originalText.slice(0, partOfTextLength),
        thread,
      )
    ).length > tokenLimit
  ) {
    console.log('sliceTextByTokens 切割文本片段太大')
    // 如果片段的token数量大于限制的token数量, 则直接返回片段
    return {
      isLimit: true,
      text:
        startSlicePosition === 'start'
          ? originalText.slice(0, partOfTextLength)
          : originalText.slice(-partOfTextLength),
      origin: originalText,
      tokens: 0,
    }
  }
  /**
   * 将文本按比率分割成头部和尾部块
   * @description 基于 [startSliceRate] * [partOfTextLength] 和 [endSliceRate] * [partOfTextLength] 填充textChunks
   * @returns {string[]} 分割后的文本块数组
   */
  const splitTextToChunks = () => {
    const startChunks = []
    const endChunks = []
    let start = 0
    let end = originalText.length
    const startChunkSize = Math.floor(startSliceRate * partOfTextLength)
    const endChunkSize = Math.floor(endSliceRate * partOfTextLength)

    while (start < end) {
      const remainingFromStart = end - start
      if (remainingFromStart < startChunkSize) {
        startChunks.push(originalText.slice(start, end))
        break
      }
      startChunks.push(originalText.slice(start, start + startChunkSize))
      start += startChunkSize

      const remainingFromEnd = end - start
      if (remainingFromEnd < endChunkSize) {
        endChunks.unshift(originalText.slice(start, end))
        break
      }
      endChunks.unshift(originalText.slice(end - endChunkSize, end))
      end -= endChunkSize
    }

    return startChunks.concat(endChunks)
  }
  // 基于 [thread] 交替从头部和尾部获取chunk.
  const textChunks = splitTextToChunks()
  const getChunkDirection = startSlicePosition === 'start' ? 'start' : 'end'
  let getChunksByThreadCurrentIndex =
    getChunkDirection === 'start' ? 0 : textChunks.length - 1
  const getChunksByThread = () => {
    const result: Array<{
      isStart: boolean
      text: string
    }> = []
    let count = 0
    while (count < thread) {
      const isAddFirst = getChunksByThreadCurrentIndex === 0
      if (textChunks.length > 0) {
        const partOfText =
          (isAddFirst ? textChunks.shift() : textChunks.pop()) || ''
        result.push({
          isStart: isAddFirst,
          text: partOfText,
        })
        count++
        // 翻转startIndex
        getChunksByThreadCurrentIndex = isAddFirst ? textChunks.length - 1 : 0
      } else {
        break
      }
    }
    return result
  }
  // 最大token上限
  const maxTokenLimit = tokenLimit - bufferTokens
  let usage = 0
  // 获取块并计算总token数,直到超过限制值或全部获取完毕
  const startResults = []
  const endResults = []

  while (textChunks.length > 0) {
    const currentChunks = getChunksByThread()
    const currentChunkWithTokens = await Promise.all(
      currentChunks.map(async (chunk, index) => {
        const tokens = await getTextTokensWithThread(chunk.text, thread)
        return { ...chunk, tokens: tokens.length }
      }),
    )

    const progress =
      ((startResults.length + endResults.length) / textChunks.length) * 100
    console.log(
      `Processing ${progress.toFixed(
        2,
      )}%, usage [${usage}] / [${maxTokenLimit}]`,
    )

    for (const { isStart, tokens, text } of currentChunkWithTokens) {
      if (usage + tokens > maxTokenLimit) {
        console.log(
          `sliceTextByTokens result usage [slice] [${usage}]`,
          originalText.startsWith(startResults.join('')),
          originalText.endsWith(endResults.join('')),
        )
        return {
          isLimit: true,
          text: [...startResults, ...endResults].join(''),
          origin: text,
          tokens: usage,
        }
      }

      usage += tokens
      if (isStart) {
        startResults.push(text)
      } else {
        endResults.unshift(text)
      }
    }
  }

  const results = [...startResults, ...endResults]
  console.log(
    `sliceTextByTokens result usage [full] [${usage}]`,
    results.join('') === originalText,
  )
  return {
    isLimit: false,
    text: results.join(''),
    origin: originalText,
    tokens: usage,
  }
}

/**
 * Calculates the maximum number of tokens to allocate for history, question, and response.
 * @param {number} maxAIModelTokens - The maximum number of tokens allowed by the AI model.
 * @returns {number} The maximum number of tokens to allocate for history, question, and response.
 * @description The returned value is the minimum of 12000 tokens and half of the AI model's maximum token limit.
 */
export const calculateMaxHistoryQuestionResponseTokens = (
  maxAIModelTokens: number,
) => {
  return Math.min(12000, maxAIModelTokens / 2)
}

/**
 * Calculates the maximum number of tokens to allocate for the response.
 * @param {number} maxAIModelTokens - The maximum number of tokens allowed by the AI model.
 * @returns {number} The maximum number of tokens to allocate for the response.
 * @description The returned value is the minimum of 2000 tokens and one-fourth of the AI model's maximum token limit.
 */
export const calculateMaxResponseTokens = (maxAIModelTokens: number) => {
  return Math.min(2000, maxAIModelTokens / 4)
}
