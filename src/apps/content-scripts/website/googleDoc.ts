/**
 * google doc下开启注解功能
 * 未申请白名单，此处伪造Wordtune的id
 */
const extId = document.currentScript?.getAttribute('data-ext-id')
;(window as any)._docs_annotate_canvas_by_ext =
  extId || 'nllcnknpjnininklegdoijpljgdjkijc'

/**
 * 对于抓取google doc内容的处理
 */
const loadPageContent = () => {
  const iframeDoc: any = (
    document.querySelector('.docs-texteventtarget-iframe') as HTMLIFrameElement
  )?.contentDocument
  const key: any = Object.keys(iframeDoc).find((k) => k.startsWith('closure_'))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const getContent = (src: any, seen: any) => {
    seen.add(src)
    if (!Array.isArray(src)) src = Object.values(src)
    for (let v, len = src.length, i = 0; i < len; i++) {
      try {
        if (
          !(v = src[i]) ||
          Object.prototype.toString.call(v) === '[object Window]' ||
          seen.has(v)
        ) {
          continue
        }
      } catch (e) {
        // console.log(e)
      }
      seen.add(v)
      if (
        (typeof v === 'string' && v[0] === '\x03' && v.endsWith('\n')) ||
        (typeof v === 'object' && (v = getContent(v, seen)))
      ) {
        return v
      }
    }
  }
  let pageContent = ''
  if (iframeDoc[key]) {
    pageContent = getContent(iframeDoc[key], new Set())
  }
  return pageContent.trim() || ''
}
window.addEventListener('MAXAI_LOAD_GOOGLE_DOC_CONTENT', (event: any) => {
  const id = event.detail?.id
  if (!id) return
  const pageContent = loadPageContent()
  window.dispatchEvent(new CustomEvent(`${id}-res`, { detail: pageContent }))
})
