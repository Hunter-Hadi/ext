import { franc } from 'franc'
import { iso6393 } from 'iso-639-3'
import countBy from 'lodash-es/countBy'
import maxBy from 'lodash-es/maxBy'

function removeMarkdownImageAndLinks(markdownText: string): string {
  const regex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(((https?:\/\/|data:image)[^)]+)\))/gi
  const links = [...markdownText.matchAll(regex)].map((m) => ({
    text: m[1],
    link: m[2],
  }))
  let cleanedText = markdownText
  //remove links
  links.forEach(({ text, link }) => {
    // 为了避免干扰，都去掉
    cleanedText = markdownText.replace(text, '')
    cleanedText = markdownText.replace(link, '')
  })
  // 不知道为什么滤不干净, 再次过滤 []()
  const linkWords = [...cleanedText.matchAll(/\[(?<Name>[^\]]+)]\([^)]+\)/g)]
  linkWords.forEach((linkWord) => {
    if (linkWord.groups?.Name) {
      cleanedText = cleanedText.replace(linkWord[0], linkWord.groups.Name)
    }
  })
  // 去掉剩下的urls
  const urlRegex = /(?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.[\w/\-&?=%.]+/gi
  cleanedText = cleanedText.replace(urlRegex, '')
  const chunks = cleanedText.split('\n').map((chunk) => {
    // 去掉markdown的格式, #, ##, -, *, >, `
    const regex = /^(?:\s*[-*]\s+|#+\s+|>\s+|`|\*\*.*\*\*|\[[^\]]+])/g
    return chunk.replace(regex, '')
  })
  return chunks.join('\n')
}

/**
 * 获取文本的语言名称
 * @param text
 * @param sliceLength
 * @param fallbackLanguageName
 */
export const textGetLanguageName = (
  text: string,
  sliceLength = 1000,
  fallbackLanguageName = 'English',
) => {
  const startTime = Date.now()
  // 截取的内容
  let sliceOfText = ''
  // 截取的内容的isoCode
  let fullSliceOfTextIsoCode = ''
  if (text.length > sliceLength) {
    // 从中间截取0-1000个字符
    const start = Math.floor((text.length - sliceLength) / 2)
    sliceOfText = text.slice(start, start + sliceLength)
  } else {
    sliceOfText = text.slice(0, sliceLength)
  }
  sliceOfText = removeMarkdownImageAndLinks(sliceOfText)
  if (
    sliceOfText.startsWith(
      'The following text delimited by triple backticks is the context text:',
    )
  ) {
    // 影响判断, 去掉
    sliceOfText = sliceOfText.replace(
      'The following text delimited by triple backticks is the context text:',
      '',
    )
  }
  // 截断\n
  const isoCodes = sliceOfText
    .split(/\n|\\n/)
    .map((sliceOfTextChunk) => {
      sliceOfTextChunk = sliceOfTextChunk.trim()
      if (sliceOfTextChunk) {
        sliceOfTextChunk = sliceOfTextChunk.replace(/\s+/g, ' ')
        if (sliceOfTextChunk.length < 20) {
          // 字数太短的话, franc可能判断不了, 重复多几次
          sliceOfTextChunk = new Array(5).fill(sliceOfTextChunk).join(' ')
        }
        const isCode = franc(sliceOfTextChunk)
        console.log(
          `textGetLanguageName isCode [${isCode}], text -> ` + sliceOfTextChunk,
        )
        return isCode
      }
      return 'und'
    })
    .filter((isoCode) => isoCode !== 'und')
  if (isoCodes.length > 0) {
    // 找出出现次数最多的isoCode
    const isoCodeCount = countBy(isoCodes)
    console.log(
      'textGetLanguageName isoCodeCount \n',
      JSON.stringify(isoCodeCount, null, 2),
    )
    // 使用countBy函数计算每个值的出现次数
    const maxIsoCode = maxBy(
      Object.keys(isoCodeCount),
      (isoCode) => isoCodeCount[isoCode],
    )
    if (maxIsoCode) {
      const languageName = iso6393.find((item) => item.iso6393 === maxIsoCode)
        ?.name
      if (maxIsoCode === 'fra') {
        // 如果是法语, 再次判断, 避免franc判断错误
        const fullTextIsoCode = franc(sliceOfText)
        if (fullTextIsoCode === 'fra') {
          console.log(
            `textGetLanguageName: [success] [${languageName}] ${
              Date.now() - startTime
            }ms, ${sliceOfText.length} characters`,
          )
          return languageName || fallbackLanguageName
        }
        // 如果不是法语, 则返回其他语言
        console.log(`textGetLanguageName retry cause [${maxIsoCode}]`)
      } else {
        // 其他语言, 直接返回
        console.log(
          `textGetLanguageName: [success] [${languageName}] ${
            Date.now() - startTime
          }ms, ${sliceOfText.length} characters`,
        )
        return languageName || fallbackLanguageName
      }
    }
  }
  // 如果前面没有找到, 则再次判断全文
  if (!fullSliceOfTextIsoCode) {
    // 如果没有找到, 匹配全文
    fullSliceOfTextIsoCode = franc(sliceOfText)
  }
  if (fullSliceOfTextIsoCode !== 'und') {
    const languageName = iso6393.find(
      (item) => item.iso6393 === fullSliceOfTextIsoCode,
    )?.name
    console.log(
      `textGetLanguageName: [success] [${languageName}] ${
        Date.now() - startTime
      }ms, ${sliceOfText.length} characters`,
    )
    return languageName || fallbackLanguageName
  }
  console.log(
    `textGetLanguageName: [error] [${fallbackLanguageName}] ${
      Date.now() - startTime
    }ms, ${sliceOfText.length} characters`,
  )
  return fallbackLanguageName
}
