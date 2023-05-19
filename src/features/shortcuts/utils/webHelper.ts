import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import cloneDeep from 'lodash-es/cloneDeep'

const cleanText = (text: string) =>
  text
    .trim()
    .replace(/(\n){4,}/g, '\n\n\n')
    // .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, '  ')
    .replace(/\t/g, '')
    .replace(/\n+(\s*\n)*/g, '\n')

export const parseDocumentToReadabilityData = (doc: Document) => {
  if (!doc) {
    return {
      title: 'Could not parse the page.',
      body: 'Could not parse the page.',
      success: false,
    }
  }
  const parsed = new Readability(doc).parse()
  if (!parsed || !parsed.textContent) {
    return {
      title: 'Could not parse the page.',
      body: 'Could not parse the page.',
      success: false,
    }
  }

  let text = cleanText(cloneDeep(parsed.textContent))
  // TODO - 放到userSettings
  // MARK: 这里截取8000个字符是为了方便后面运行
  const trimLongText = true
  if (trimLongText && text.length > 8000) {
    text = text.slice(0, 8000)
    // text +=
    //   "\n\n[Text has been trimmed to 14,500 characters. You can disable this on WebChatGPT's options page.]"
  }
  return { title: parsed.title, body: text, success: true }
}

export async function getWebpageTitleAndText(
  url: string,
  html_str = '',
): Promise<{
  title: string
  body: string
  url: string
  success: boolean
}> {
  let html = html_str
  if (!html) {
    let response: Response
    try {
      response = await fetch(url.startsWith('http') ? url : `https://${url}`)
    } catch (e) {
      return {
        title: 'Could not fetch the page.',
        body: `Could not fetch the page: ${e}.\nMake sure the URL is correct.`,
        url,
        success: false,
      }
    }
    if (!response.ok) {
      return {
        title: 'Could not fetch the page.',
        body: `Could not fetch the page: ${response.status} ${response.statusText}`,
        url,
        success: false,
      }
    }
    html = await response.text()
  }

  const doc = parseHTML(html).document
  const result = parseDocumentToReadabilityData(doc)
  return {
    url,
    ...result,
  }
}
