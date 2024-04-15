import Browser from 'webextension-polyfill'

const initGoogleDoc = () => {
  const script = document.createElement('script')
  script.src = Browser.runtime.getURL(
    'pages/googleDoc/enableCanvasAnnotations.js',
  )
  // script.setAttribute('data-ext-id', Browser.runtime.id);
  // 未申请白名单，此处伪造Wordtune的id
  script.setAttribute('data-ext-id', 'nllcnknpjnininklegdoijpljgdjkijc')
  document.head.appendChild(script)
}

const checkDocument = (task: () => void) => {
  if (!document?.head?.appendChild) {
    const timer = setInterval(() => {
      if (!document?.head?.appendChild) return
      clearInterval(timer)
      task()
    }, 0)
  } else {
    task() 
  }
}

if (window.location.href.startsWith('https://docs.google.com/document')) {
  checkDocument(initGoogleDoc)
}
