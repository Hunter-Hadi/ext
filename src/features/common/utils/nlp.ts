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

// 优先使用的语言
const top20Languages = [
  'eng', // 英语
  'cmn', // 汉语（官话方言）
  'hin', // 印地语
  'spa', // 西班牙语
  // 'fra', // 法语
  'ara', // 阿拉伯语
  'ben', // 孟加拉语
  'rus', // 俄语
  'por', // 葡萄牙语
  'ind', // 印尼语
  'urd', // 乌尔都语
  'deu', // 德语
  'jpn', // 日语
  'swa', // 斯瓦希里语
  'mar', // 马拉地语
  'tel', // 泰卢固语
  'yue', // 粤语
  'ita', // 意大利语
  'kor', // 韩语
  'pol', // 波兰语
]

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

        const isCode = franc(sliceOfTextChunk)
        console.log(
          `textGetLanguageName isoCode [${isCode}], text -> ` +
            sliceOfTextChunk,
        )
        return isCode
      }
      return 'und'
    })
    .filter((isoCode) => isoCode !== 'und')
  if (isoCodes.length > 1) {
    // 找出出现次数最多的isoCode
    const isoCodeCount = countBy(isoCodes)
    // 过滤值为1的
    Object.keys(isoCodeCount).forEach((isoCode) => {
      if (isoCodeCount[isoCode] === 1) {
        delete isoCodeCount[isoCode]
      }
    })
    console.log(
      'textGetLanguageName isoCodeCount \n',
      JSON.stringify(isoCodeCount, null, 2),
    )
    // 如果有值, 则返回出现次数最多的
    if (Object.keys(isoCodeCount).length > 0) {
      // 使用countBy函数计算每个值的出现次数
      const maxIsoCode = maxBy(
        Object.keys(isoCodeCount),
        (isoCode) => isoCodeCount[isoCode],
      )
      if (maxIsoCode) {
        if (top20Languages.includes(maxIsoCode)) {
          console.log(
            `textGetLanguageName: [success] [top20] [max] [${maxIsoCode}] ${
              Date.now() - startTime
            }ms, text: ${sliceOfText}, ${sliceOfText.length} characters`,
          )
          return iso6393.find((item) => item.iso6393 === maxIsoCode)?.name
        }
        // 如果不是top20的语言, 则看看第二多的是不是top20的语言
        const secondMaxIsoCode = maxBy(
          Object.keys(isoCodeCount),
          (isoCode) => isoCodeCount[isoCode] !== isoCodeCount[maxIsoCode],
        )
        // 如果第二多的是top20的语言，并且差距第一不到2, 则使用第二多的
        if (
          secondMaxIsoCode &&
          top20Languages.includes(secondMaxIsoCode) &&
          isoCodeCount[maxIsoCode] - isoCodeCount[secondMaxIsoCode] <= 2
        ) {
          console.log(
            `textGetLanguageName: [success] [top20] [second] [${secondMaxIsoCode}] ${
              Date.now() - startTime
            }ms, text: ${sliceOfText}, ${sliceOfText.length} characters`,
          )
          return iso6393.find((item) => item.iso6393 === secondMaxIsoCode)?.name
        }
      }
    }
  }
  // 如果前面没有找到, 则判断全文
  if (sliceOfText.length < 20) {
    // 字数太短的话, franc可能判断不了, 重复多几次
    sliceOfText = new Array(5).fill(sliceOfText).join(' ')
  }
  // 如果没有找到, 匹配全文
  const fullSliceOfTextIsoCode = franc(sliceOfText)
  // 如果是top20的语言, 则直接返回
  if (top20Languages.includes(fullSliceOfTextIsoCode)) {
    const languageName = iso6393.find(
      (item) => item.iso6393 === fullSliceOfTextIsoCode,
    )?.name
    console.log(
      `textGetLanguageName full text: [success] [${languageName}] ${
        Date.now() - startTime
      }ms, text: ${sliceOfText}, ${sliceOfText.length} characters`,
    )
    return languageName || fallbackLanguageName
  }
  console.log(
    `textGetLanguageName: [error] [${fallbackLanguageName}] ${
      Date.now() - startTime
    }ms, text: ${sliceOfText}, ${
      sliceOfText.length
    } characters, fullSliceOfTextIsoCode: ${fullSliceOfTextIsoCode}`,
  )
  return fallbackLanguageName
}
