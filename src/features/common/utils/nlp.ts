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
    const regex = /^(?:\s*[-*]\s+|#+\s+|>\s+|`)/g
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
  let sliceOfText = removeMarkdownImageAndLinks(text.slice(0, sliceLength))
  // 移除多余的空格
  sliceOfText = sliceOfText.replace(/\s{2,}/g, ' ')
  if (sliceOfText.length < 20) {
    // 字数太短的话, franc可能判断不了, 重复多几次
    sliceOfText = new Array(5).fill(sliceOfText).join('\n')
  }
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
    .split('\n')
    .map((text) => {
      if (text.trim()) {
        const isCode = franc(text)
        console.log('textGetLanguageName: [isCode]', isCode, text)
        return isCode
      }
      return 'und'
    })
    .filter((isoCode) => isoCode !== 'und')
  // 找出出现次数最多的isoCode
  const isoCodeCount = countBy(isoCodes)
  // 使用countBy函数计算每个值的出现次数
  const maxIsoCode = maxBy(
    Object.keys(isoCodeCount),
    (isoCode) => isoCodeCount[isoCode],
  )
  if (maxIsoCode) {
    const languageName = iso6393.find((item) => item.iso6393 === maxIsoCode)
      ?.name
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
