import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App'
import { RecoilRoot } from 'recoil'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
ClassNameGenerator.configure(
  (componentName) => `ezmail-ai-crx--${componentName}`,
)

import ChatGPTDaemonProcess from './pages/ChatGPTDaemonProcessPage'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
// import createCache from '@emotion/cache'

if (location.host === 'chat.openai.com') {
  const div = document.createElement('div')
  div.id = 'EzMail_AI_ChatGPT_DaemonProcess_ROOT'
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
  console.log('init ezmail.ai client')
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
  const container = document.createElement('div')
  container.id = 'EzMail_AI_ROOT'
  document.body.appendChild(container)
  const shadowContainer = container.attachShadow({ mode: 'open' })
  const emotionRoot = document.createElement('style')
  const shadowRootElement = document.createElement('div')
  shadowRootElement.id = 'EzMail_AI_ROOT_Wrapper'
  shadowRootElement.style.display = 'flex'
  shadowRootElement.style.flexDirection = 'column'
  shadowRootElement.style.flex = '1'
  shadowRootElement.style.height = '100vh'
  shadowContainer.appendChild(emotionRoot)
  shadowContainer.appendChild(shadowRootElement)
  ;(window as any).__EZ_MAIL_AI_ROOT_shadowRoot = shadowContainer
  const cache = createCache({
    key: 'ezmail-ai-emotion-cache',
    prepend: true,
    container: emotionRoot,
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createRoot(shadowRootElement).render(
    <React.StrictMode>
      <RecoilRoot>
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
