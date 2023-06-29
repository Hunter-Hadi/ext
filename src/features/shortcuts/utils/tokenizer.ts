import { encode } from 'gpt-3-encoder-browser'

// 基于 chatgpt 3.5 的 token 限制
export const MAX_CHARACTERS_TOKENS = 4096

// 切割字符的 缓冲值
export const SLICE_BUFFER = 0.8

// 估算每个单词的token
export const getEachWordToken = async (text: string) => {
  const length = text.length
  const tokens = await encode(text)
  return length / tokens.length
}

// 获取 text 的 token 值
export const getTextTokens = async (text: string) => {
  try {
    const tokens = await encode(text)
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
}

// 根据token 计算后返回 slice end 的位置
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

// 根据限制的 token 数量去截取文本
export const sliceTextByTokens = async (text: string, tokenLimit?: number) => {
  const sliceEnd = await getSliceEnd(text, tokenLimit)
  return text.slice(0, sliceEnd)
}
