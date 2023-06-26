import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import {
  ROOT_CONTAINER_ID,
  ROOT_CONTAINER_WRAPPER_ID,
  ROOT_CONTEXT_MENU_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/constants'
import AppThemeProvider from '@/components/AppTheme'
import Browser from 'webextension-polyfill'
// import createCache from '@emotion/cache'
const AppNameToClassName = String(process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
ClassNameGenerator.configure(
  (componentName) => `${AppNameToClassName}--${componentName}`,
)

if (location.host === 'chat.openai.com') {
  import('./pages/OpenAIDaemonProcess').then((module) => {
    const { default: OpenAIDaemonProcess } = module
    const div = document.createElement('div')
    div.id = ROOT_DAEMON_PROCESS_ID
    document.body.appendChild(div)
    const root = createRoot(div)
    const style = document.createElement('style')
    style.innerHTML = `#__next.ezmail-ai-running > div > div {
  padding-top: 40px;
}
.ezmail-ai-setting-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 2s linear infinite;
}
#__next.use-chat-gpt-ai-running > div > div {
  padding-top: 40px;
}
.use-chat-gpt-ai-setting-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(1turn);
  }
}
a.chatgpt-ad {
  display: none;
}
`
    document.head.appendChild(style)
    root.render(
      <React.StrictMode>
        <OpenAIDaemonProcess />
      </React.StrictMode>,
    )
  })
} else {
  import('./pages/App').then((module) => {
    const { default: App } = module
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = Browser.runtime.getURL('content.css')
    document.head.appendChild(link)
    console.log('init client')
    const isSupportWebComponent = 'customElements' in window
    const contextMenu = document.createElement(
      isSupportWebComponent ? 'use-chat-gpt-ai-content-menu' : 'div',
    )
    contextMenu.id = ROOT_CONTEXT_MENU_ID
    document.body.appendChild(contextMenu)
    const container = document.createElement(
      isSupportWebComponent ? 'use-chat-gpt-ai' : 'div',
    )
    container.id = ROOT_CONTAINER_ID
    container.style.display = 'none'
    document.body.appendChild(container)
    const shadowContainer = container.attachShadow({ mode: 'open' })
    const emotionRoot = document.createElement('style')
    const shadowRootElement = document.createElement('div')
    shadowRootElement.id = ROOT_CONTAINER_WRAPPER_ID
    shadowRootElement.style.display = 'flex'
    shadowRootElement.style.flexDirection = 'column'
    shadowRootElement.style.flex = '1'
    shadowRootElement.style.height = '100vh'
    // shadowRootElement.style.width = '100vw'
    // shadowRootElement.style.position = 'absolute'
    // shadowRootElement.style.top = '0'
    // shadowRootElement.style.left = 'calc(-100vw + 100%)'
    // shadowRootElement.style.pointerEvents = 'none'
    shadowContainer.appendChild(emotionRoot)
    shadowContainer.appendChild(shadowRootElement)
    const contentStyle = document.createElement('link')
    contentStyle.rel = 'stylesheet'
    contentStyle.href = Browser.runtime.getURL('content_style.css')
    shadowContainer.appendChild(contentStyle)
    const cache = createCache({
      key: `${AppNameToClassName}-emotion-cache`,
      prepend: true,
      container: emotionRoot,
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    createRoot(shadowRootElement).render(
      <React.StrictMode>
        <RecoilRoot>
          <CacheProvider value={cache}>
            <AppThemeProvider shadowRootElement={shadowRootElement}>
              <App />
            </AppThemeProvider>
          </CacheProvider>
        </RecoilRoot>
      </React.StrictMode>,
    )
  })
}
