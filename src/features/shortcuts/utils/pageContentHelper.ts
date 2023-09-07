// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import Parser from '@/lib/@postlight/parser'
import { Readability } from '@mozilla/readability'
import TurndownService from 'turndown'

export const getPageContentWithNpmParserPackages = async (
  url: string,
  html?: string,
) => {
  try {
    const clonedDocument = document.cloneNode(true)
    const reader = new Readability(clonedDocument as any)
    const readabilityArticle = reader.parse()
    const htmlContent = html
      ? html
      : typeof window !== 'undefined'
      ? document.documentElement.innerHTML
      : undefined
    if (!readabilityArticle || !readabilityArticle?.content) {
      // const result = await Parser.parse(url, {
      //   html: htmlContent,
      //   contentType: 'markdown',
      // })
      // const postlightResult = `# ${result.title}\n\n${result.content}\n`
      // console.log('Parser vs [postlight] parse result: \n', postlightResult)
      // return postlightResult
      return htmlContent
    }
    const turndownService = new TurndownService()
    const readabilityMarkdown = turndownService.turndown(
      readabilityArticle?.content || '',
    )
    const readabilityResult = `# ${readabilityArticle?.title}\n\n${readabilityMarkdown}\n`
    console.log('Parser vs [Readability] parse result: \n', readabilityResult)
    return readabilityResult
  } catch (e) {
    console.log(e)
    return document.body.innerText || ''
  }
}
