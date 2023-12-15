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
  return cleanedText
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
  if (sliceOfText.length < 20) {
    // 字数太短的话, franc可能判断不了, 重复多几次
    sliceOfText = new Array(5).fill(sliceOfText).join('\n')
  }
  const isoCode = franc(sliceOfText)
  if (isoCode === 'und') {
    // 截断\n
    const isoCodes = sliceOfText
      .split('\n')
      .map((text) => franc(text))
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
  } else {
    const languageName = iso6393.find((item) => item.iso6393 === isoCode)?.name
    console.log(
      `textGetLanguageName: [success] [${languageName}] ${
        Date.now() - startTime
      }ms, ${sliceOfText.length}
      characters`,
    )
    return languageName || fallbackLanguageName
  }
}
