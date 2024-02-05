import { Readability } from '@mozilla/readability'
import { HTMLDocument } from 'linkedom/types/html/document'
import TurndownService from 'turndown'

function removeImagesFromMarkdown(markdownText: string): string {
  const lines: string[] = markdownText.split('\n')
  const filteredLines: string[] = lines.filter(
    (line: string) =>
      !line.startsWith('![') &&
      !line.startsWith('**![') &&
      !line.startsWith('[![') &&
      !line.startsWith('![!['),
  )
  const cleanedText: string = filteredLines.join('\n')
  return cleanedText
}

const getPageContentWithMozillaReadability = async (
  replaceBody?: HTMLElement,
) => {
  try {
    const clonedDocument = (document.cloneNode(true) as any) as HTMLDocument
    if (clonedDocument && replaceBody) {
      clonedDocument.body.innerHTML = replaceBody.innerHTML
    }
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
    return removeImagesFromMarkdown(readabilityResult)
  } catch (e) {
    console.log(e)
    return ''
  }
}
export default getPageContentWithMozillaReadability
