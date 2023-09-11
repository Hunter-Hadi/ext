import { Readability } from '@mozilla/readability'
import TurndownService from 'turndown'

const getPageContentWithMozillaReadability = async () => {
  try {
    const clonedDocument = document.cloneNode(true)
    const reader = new Readability(clonedDocument as any)
    const readabilityArticle = reader.parse()
    if (!readabilityArticle || !readabilityArticle?.content) {
      return document.body.innerText || ''
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
    return ''
  }
}
export default getPageContentWithMozillaReadability
