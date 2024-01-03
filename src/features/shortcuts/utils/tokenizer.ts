// 基于 chatgpt 3.5 的 token 限制
import cl100k_base from 'gpt-tokenizer/esm/encoding/cl100k_base'

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
    const tokens = cl100k_base.encode(text)
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
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
  text: string,
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
    (await getTextTokensWithThread(text.slice(0, partOfTextLength), thread))
      .length > tokenLimit
  ) {
    console.log('sliceTextByTokens 切割文本片段太大')
    // 如果片段的token数量大于限制的token数量, 则直接返回片段
    return {
      isLimit: true,
      text:
        startSlicePosition === 'start'
          ? text.slice(0, partOfTextLength)
          : text.slice(-partOfTextLength),
      origin: text,
      tokens: 0,
    }
  }
  const textChunks: string[] = []
  // 基于 [startSliceRate] * [partOfTextLength] 和 [endSliceRate] * [partOfTextLength] 填充textChunks
  const fillTextChunks = () => {
    // 从头部开始
    const startSliceChunkSize = startSliceRate * partOfTextLength
    // 从尾部开始
    const endSliceChunkSize = endSliceRate * partOfTextLength
    let startSlicePosition = 0
    let endSlicePosition = text.length
    const startChunks = []
    const endChunks = []
    while (startSlicePosition < endSlicePosition) {
      if (startSliceChunkSize + startSlicePosition > endSlicePosition) {
        // 如果剩余的长度不够一个chunk
        startChunks.push(
          text.slice(
            startSlicePosition,
            startSlicePosition + endSlicePosition - startSlicePosition,
          ),
        )
        startSlicePosition += endSlicePosition - startSlicePosition
      } else {
        // 如果剩余的长度够一个chunk
        startChunks.push(
          text.slice(
            startSlicePosition,
            startSlicePosition + startSliceChunkSize,
          ),
        )
        startSlicePosition += startSliceChunkSize
      }
      if (startSlicePosition >= endSlicePosition) {
        break
      }
      if (endSlicePosition - endSliceChunkSize < startSlicePosition) {
        // 如果剩余的长度不够一个chunk
        endChunks.unshift(
          text.slice(
            endSlicePosition - (endSlicePosition - startSlicePosition),
            endSlicePosition,
          ),
        )
        endSlicePosition -= endSlicePosition - startSlicePosition
      } else {
        // 如果剩余的长度够一个chunk
        endChunks.unshift(
          text.slice(endSlicePosition - endSliceChunkSize, endSlicePosition),
        )
        endSlicePosition -= endSliceChunkSize
      }
    }
    textChunks.push(...startChunks, ...endChunks)
  }
  fillTextChunks()
  const totalChunks = textChunks.length
  let currentDirection = startSlicePosition === 'end' ? 'end' : 'start'
  // 基于 [thread] 从头尾获取本次计算的 chunks
  const getChunksByThead = () => {
    const result: Array<{
      start: boolean
      text: string
    }> = []
    let count = 0
    while (count < thread) {
      if (textChunks.length === 0) {
        break
      }
      // 如果是从尾部开始
      if (currentDirection === 'end') {
        // 如果是偶数
        if (count % 2 === 0) {
          // 从尾部获取
          result.push({
            start: false,
            text: textChunks.pop() || '',
          })
        } else {
          // 从头部
          result.push({
            start: true,
            text: textChunks.shift() || '',
          })
        }
        currentDirection = 'start'
      } else {
        // 如果是从头部开始
        // 如果是偶数
        if (count % 2 === 0) {
          // 从头部
          result.push({
            start: true,
            text: textChunks.shift() || '',
          })
        } else {
          // 从尾部获取
          result.push({
            start: false,
            text: textChunks.pop() || '',
          })
        }
        currentDirection = 'end'
      }
      count++
    }
    return result
  }
  // 最大token上限
  const maxTokenLimit = tokenLimit - bufferTokens
  let usage = 0
  const startResults: string[] = []
  const endResults: string[] = []
  while (textChunks.length > 0) {
    const currentChunks = getChunksByThead()
    const currentTokens = await Promise.all(
      currentChunks.map(async (chunk) => {
        const tokens = await getTextTokensWithThread(chunk.text, thread)
        return {
          start: chunk.start,
          tokens: tokens.length,
          text: chunk.text,
        }
      }),
    )
    for (let i = 0; i < currentTokens.length; i++) {
      console.log(
        `sliceTextByTokens process ${Number(
          ([...startResults, ...endResults].length / totalChunks) * 100,
        ).toFixed(2)}%, usage [${usage}] / [${maxTokenLimit}]`,
      )
      const currentToken = currentTokens[i]
      if (usage + currentToken.tokens > maxTokenLimit) {
        console.log(`sliceTextByTokens result usage [${usage}]`)
        return {
          isLimit: true,
          text: [...startResults, ...endResults].join(''),
          origin: text,
          tokens: usage,
        }
      }
      usage += currentToken.tokens
      if (currentToken.start) {
        startResults.push(currentToken.text)
      } else {
        endResults.unshift(currentToken.text)
      }
    }
  }

  const results = [...startResults, ...endResults]
  console.log(
    `sliceTextByTokens result usage [${usage}]`,
    results.join('') === text,
  )
  return {
    isLimit: false,
    text: results.join(''),
    origin: text,
    tokens: usage,
  }
}
