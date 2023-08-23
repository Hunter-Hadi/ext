// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Parser from '@/lib/@postlight/parser'
export const getPageContentWithPostlightParser = async (
  url: string,
  html?: string,
) => {
  const htmlContent = html
    ? html
    : typeof window !== 'undefined'
    ? document.documentElement.innerHTML
    : undefined
  try {
    const result = await Parser.parse(url, {
      html: htmlContent,
      contentType: 'markdown',
    })
    return `# ${result.title}\n\n${result.content}\n`
  } catch (e) {
    console.log(e)
    return htmlContent || ''
  }
}
