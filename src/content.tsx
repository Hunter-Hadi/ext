import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import Browser from 'webextension-polyfill'

import {
  getMaxAIChromeExtensionInstalledDeviceId,
  MaxAIInstalledDeviceIdManager,
} from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import AppThemeProvider from '@/components/AppTheme'
import { APP_VERSION, CHATGPT_WEBAPP_HOST } from '@/constants'
import {
  MAXAI_CHATGPT_WEBAPP_DAEMON_PROCESS_ID,
  MAXAI_CHROME_EXTENSION_ID,
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_SIDEBAR_ID,
  MAXAI_SIDEBAR_WRAPPER_ID,
} from '@/features/common/constants'
import { globalVideoPopupRender } from '@/features/video_popup/utils/globalVideoPopupRender'
import { isSupportWebComponent } from '@/utils/dataHelper/elementHelper'
import {
  getCurrentDomainHost,
  isMaxAIImmersiveChatPage,
} from '@/utils/dataHelper/websiteHelper'

import SPARootProtector from './utils/SPARootProtector'

const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')

ClassNameGenerator.configure(
  (componentName) => `${AppNameToClassName}--${componentName}`,
)

const supportWebComponent = isSupportWebComponent()

const mainAppRender = () => {
  const domainHost = getCurrentDomainHost()
  const App = React.lazy(() => import('./pages/App'))
  const ImmersiveChatApp = React.lazy(
    () => import('./pages/chat/ImmersiveChatApp'),
  )

  const CONTENT_CSS_LINK_TAG_ID = `${MAXAI_CHROME_EXTENSION_ID}_CONTENT_CSS_LINK_TAG`
  const renderContentCssTag = () => {
    const link = document.createElement('link')
    // 24.05.07: fix tencent cloud console style issue
    if (domainHost === 'console.cloud.tencent.com') {
      link.setAttribute('charset', 'utf-8')
      link.setAttribute('data-role', 'global')
    }
    link.id = CONTENT_CSS_LINK_TAG_ID
    link.rel = 'stylesheet'
    link.href = Browser.runtime.getURL('content.css')
    document.head.appendChild(link)
  }
  renderContentCssTag()
  SPARootProtector.addProtectedRoot({
    rootId: CONTENT_CSS_LINK_TAG_ID,
    renderFn: renderContentCssTag,
  })

  const fontLink = document.createElement('link')
  // 24.05.07: fix tencent cloud console style issue
  if (domainHost === 'console.cloud.tencent.com') {
    fontLink.setAttribute('charset', 'utf-8')
    fontLink.setAttribute('data-role', 'global')
  }
  fontLink.rel = 'stylesheet'
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap'
  document.head.appendChild(fontLink)

  console.log('init client')
  const container = document.createElement(
    supportWebComponent ? 'use-chat-gpt-ai' : 'div',
  )
  container.id = MAXAI_SIDEBAR_ID
  // 这一句在lastpass这个插件里会把该容器下的所有input组件的display也改成none，改为class
  // container.style.display = 'none'
  container.classList.add('close')
  container.setAttribute('data-version', APP_VERSION)
  document.body.appendChild(container)
  const contextMenu = document.createElement(
    supportWebComponent ? 'use-chat-gpt-ai-content-menu' : 'div',
  )
  contextMenu.id = MAXAI_CONTEXT_MENU_ID
  if (domainHost === 'youtube.com' || domainHost === 'studio.youtube.com') {
    contextMenu.contentEditable = 'true'
  }
  document.body.appendChild(contextMenu)

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

  const root = createRoot(shadowRootElement)

  SPARootProtector.addProtectedRoot({
    rootId: MAXAI_SIDEBAR_ID,
    reactRoot: root,
    renderFn: mainAppRender,
  })

  root.render(
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

  globalVideoPopupRender()
}
const ChatGPTWebAppRender = () => {
  if (location.host === CHATGPT_WEBAPP_HOST) {
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
}
const initClientExtensionId = async () => {
  const extensionId = await getMaxAIChromeExtensionInstalledDeviceId()
  MaxAIInstalledDeviceIdManager.setExtensionId(extensionId)
  return extensionId
}

const start = async () => {
  fixSpecialHostStyleIssues()
  await initClientExtensionId()
  mainAppRender()
  ChatGPTWebAppRender()
}

const fixSpecialHostStyleIssues = () => {
  const domainHost = getCurrentDomainHost()

  if (domainHost === 'zapier.com') {
    // 修复 zapier.com 下 style 标签的顺序问题
    const styleElements = Array.from(document.getElementsByTagName('style'))
    const head = document.head
    for (const styleElement of styleElements) {
      if (
        styleElement &&
        styleElement.getAttribute('data-emotion') &&
        styleElement.innerHTML.includes('[data-zds]:where')
      ) {
        head.insertBefore(styleElement, head.firstChild)
      }
    }
  }
}
start().then().catch()
