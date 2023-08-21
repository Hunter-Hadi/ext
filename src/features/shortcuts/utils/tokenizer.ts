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
export const sliceTextByTokens = async (
  text: string,
  tokenLimit: number,
  options?: {
    bufferTokens?: number
    startSliceRate?: number
    endSliceRate?: number
    startSlicePosition?: 'start' | 'end'
    partOfTextLength?: number
  },
) => {
  const totalTokens = (await getTextTokens(text)).length
  if (totalTokens <= tokenLimit) {
    console.log('新版Conversation 切割文本片段太小', totalTokens)
    return text
  }
  const {
    bufferTokens = 0,
    startSliceRate = 1,
    endSliceRate = 1,
    partOfTextLength = 1000,
    startSlicePosition = 'end',
  } = options || {}
  if (
    (await getTextTokens(text.slice(0, partOfTextLength))).length > tokenLimit
  ) {
    console.log('新版Conversation 切割文本片段太大')
    // 如果片段的token数量大于限制的token数量, 则直接返回片段
    return startSlicePosition === 'start'
      ? text.slice(0, partOfTextLength)
      : text.slice(-partOfTextLength)
  }
  let startSlicedText = ''
  let endSlicedText = ''
  const currentTokenLimit = tokenLimit - bufferTokens
  // middle out原则, 每次提取(partOfTextLength * startSliceRate/endSliceRate)个字符
  const extractAndUpdateText = (length: number, fromStart = true) => {
    const sliceLength = fromStart
      ? startSliceRate * length
      : endSliceRate * length
    if (fromStart) {
      const subText = text.slice(0, sliceLength)
      text = text.slice(sliceLength)
      return subText
    } else {
      const subText = text.slice(-sliceLength)
      text = text.slice(0, -sliceLength)
      return subText
    }
  }
  let useTokens = 0
  const addEndSubText = async () => {
    const endSubtext = extractAndUpdateText(partOfTextLength, false)
    if (!endSubtext) {
      return false
    }
    const tokens = (await getTextTokens(endSubtext)).length
    if (useTokens + tokens > currentTokenLimit) {
      return false
    }
    useTokens += tokens
    endSlicedText = endSubtext + endSlicedText
    return true
  }
  const addStartSubText = async () => {
    const startSubtext = extractAndUpdateText(partOfTextLength, true)
    if (!startSubtext) {
      return false
    }
    const tokens = (await getTextTokens(startSubtext)).length
    if (useTokens + tokens > currentTokenLimit) {
      return false
    }
    useTokens += tokens
    startSlicedText = startSlicedText + startSubtext
    return true
  }
  while (useTokens < currentTokenLimit) {
    // 从尾部开始
    if (startSlicePosition === 'end') {
      if (!(await addEndSubText())) {
        break
      }
      if (!(await addStartSubText())) {
        break
      }
    } else {
      // 从头部开始
      if (!(await addStartSubText())) {
        break
      }
      if (!(await addEndSubText())) {
        break
      }
    }
  }
  console.log(
    '新版Conversation 切割文本',
    useTokens,
    '\nstart: \n' + startSlicedText + '\nend:\n' + endSlicedText,
  )
  return startSlicedText + endSlicedText
}
