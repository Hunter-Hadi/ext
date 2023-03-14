import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App'
import { RecoilRoot } from 'recoil'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
const AppNameToClassName = (process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
ClassNameGenerator.configure(
  (componentName) => `${AppNameToClassName}--${componentName}`,
)

import ChatGPTDaemonProcess from './pages/ChatGPTDaemonProcessPage'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material'
import customMuiTheme from '@/pages/customMuiTheme'
import {
  ROOT_CONTAINER_ID,
  ROOT_CONTAINER_WRAPPER_ID,
  ROOT_CONTEXT_MENU_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/types'
// import createCache from '@emotion/cache'
console.log(process.env.NODE_ENV)
console.log(process.env.APP_ENV)
console.log(process.env.APP_NAME)
if (location.host === 'chat.openai.com') {
  const div = document.createElement('div')
  div.id = ROOT_DAEMON_PROCESS_ID
  const nav = document.getElementsByTagName('nav')?.[0]
  console.log(nav)
  document.body.appendChild(div)
  const root = createRoot(div)
  root.render(
    <React.StrictMode>
      <ChatGPTDaemonProcess />
    </React.StrictMode>,
  )
} else {
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
  const contextMenu = document.createElement('div')
  contextMenu.id = ROOT_CONTEXT_MENU_ID
  document.body.appendChild(contextMenu)
  const container = document.createElement('div')
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
          <ThemeProvider theme={customMuiTheme(shadowRootElement)}>
            <App />
          </ThemeProvider>
        </CacheProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
