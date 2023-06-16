import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
const AppNameToClassName = String(process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
ClassNameGenerator.configure(
  (componentName) => `${AppNameToClassName}--${componentName}`,
)

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import {
  ROOT_CONTAINER_ID,
  ROOT_CONTAINER_WRAPPER_ID,
  ROOT_CONTEXT_MENU_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/constants'
import AppThemeProvider from '@/components/AppTheme'
// import createCache from '@emotion/cache'
if (location.host === 'chat.openai.com') {
  import('./pages/OpenAIDaemonProcess').then((module) => {
    const { default: OpenAIDaemonProcess } = module
    const div = document.createElement('div')
    div.id = ROOT_DAEMON_PROCESS_ID
    document.body.appendChild(div)
    const root = createRoot(div)
    root.render(
      <React.StrictMode>
        <OpenAIDaemonProcess />
      </React.StrictMode>,
    )
  })
} else {
  import('./pages/App').then((module) => {
    const { default: App } = module
    console.log('init client')
    // Create web component with target div inside it.

    // document.body.appendChild(container)
    // const shadowContainer = container.attachShadow({ mode: 'open' })
    // const emotionRoot = document.createElement('style')
    // const shadowRootElement = document.createElement('div')
    // shadowContainer.appendChild(emotionRoot)
    // shadowContainer.appendChild(shadowRootElement)
    // const cache = createCache({
    //   key: 'css',
    //   container: emotionRoot,
    // })
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
