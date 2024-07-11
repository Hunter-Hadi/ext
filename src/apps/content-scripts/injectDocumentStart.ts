import Browser from 'webextension-polyfill'

const injectScripts = (path: string) => {
  const script = document.createElement('script')
  script.src = Browser.runtime.getURL(path)
  // script.setAttribute('data-ext-id', Browser.runtime.id);
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

// 注入google doc
// if (window.location.href.startsWith('https://docs.google.com/document')) {
if (window.location.host === 'docs.google.com') {
  checkDocument(() =>
    injectScripts('apps/content-scripts/website/googleDoc.js'),
  )
}

// 注入youtube studio
if (window.location.host === 'studio.youtube.com') {
  checkDocument(() =>
    injectScripts('apps/content-scripts/website/youtubeStudio.js'),
  )
}
