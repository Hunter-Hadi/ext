const loadPageContent = () => {
  const iframeDoc: any = (
    document.querySelector('.docs-texteventtarget-iframe') as HTMLIFrameElement
  )?.contentDocument
  const script = document.getElementById('MAXAI_GOOGLE_DOC_CONTENT_SCRIPT')
  const eventId = script?.getAttribute('data-event-id')
  if (iframeDoc && eventId) {
    const key: any = Object.keys(iframeDoc).find((k) =>
      k.startsWith('closure_'),
    )
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
    window.dispatchEvent(
      new CustomEvent(`${eventId}res`, { detail: pageContent.trim() || '' }),
    )
  }
  script?.remove()
}

loadPageContent()
