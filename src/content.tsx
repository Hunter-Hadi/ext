import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import Browser from 'webextension-polyfill'

import AppThemeProvider from '@/components/AppTheme'
import { APP_VERSION } from '@/constants'
import {
  MAXAI_CHATGPT_WEBAPP_DAEMON_PROCESS_ID,
  MAXAI_CHROME_EXTENSION_ID,
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_SIDEBAR_ID,
  MAXAI_SIDEBAR_WRAPPER_ID,
} from '@/features/common/constants'
import {
  getCurrentDomainHost,
  isMaxAIImmersiveChatPage,
} from '@/utils/dataHelper/websiteHelper'
// import createCache from '@emotion/cache'
const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')
ClassNameGenerator.configure(
  (componentName) => `${AppNameToClassName}--${componentName}`,
)
if (location.host === 'chat.openai.com') {
  const script = document.createElement('script')
  script.type = 'module'
  script.src = Browser.runtime.getURL('/pages/chatgpt/fileUploadServer.js')
  ;(document.head || document.documentElement).append(script)
  import('./pages/OpenAIDaemonProcess').then((module) => {
    const { default: OpenAIDaemonProcess } = module
    const div = document.createElement('div')
    div.id = MAXAI_CHATGPT_WEBAPP_DAEMON_PROCESS_ID
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
}

const App = React.lazy(() => import('./pages/App'))
const ImmersiveChatApp = React.lazy(
  () => import('./pages/chat/ImmersiveChatApp'),
)
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = Browser.runtime.getURL('content.css')
document.head.appendChild(link)
console.log('init client')
const isSupportWebComponent = 'customElements' in window
const contextMenu = document.createElement(
  isSupportWebComponent ? 'use-chat-gpt-ai-content-menu' : 'div',
)
contextMenu.id = MAXAI_CONTEXT_MENU_ID
if (
  getCurrentDomainHost() === 'youtube.com' ||
  getCurrentDomainHost() === 'studio.youtube.com'
) {
  contextMenu.contentEditable = 'true'
}
document.body.appendChild(contextMenu)
const container = document.createElement(
  isSupportWebComponent ? 'use-chat-gpt-ai' : 'div',
)
container.id = MAXAI_SIDEBAR_ID
container.style.display = 'none'
container.setAttribute('data-version', APP_VERSION)
document.body.appendChild(container)
const shadowContainer = container.attachShadow({ mode: 'open' })
const emotionRoot = document.createElement('style')
const shadowRootElement = document.createElement('div')
shadowRootElement.id = MAXAI_SIDEBAR_WRAPPER_ID
shadowRootElement.style.display = 'flex'
shadowRootElement.style.flexDirection = 'column'
shadowRootElement.style.flex = '1'
shadowRootElement.style.height = '100vh'
if (isMaxAIImmersiveChatPage()) {
  shadowRootElement.setAttribute('data-maxai-newtab', 'true')
}
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
const queryClient = new QueryClient()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
createRoot(shadowRootElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={cache}>
          <AppThemeProvider shadowRootElement={shadowRootElement}>
            {isMaxAIImmersiveChatPage() ? <ImmersiveChatApp /> : <App />}
          </AppThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>,
)
