import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './pages/App'
import { RecoilRoot } from 'recoil'
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className'
ClassNameGenerator.configure(
  (componentName) => `ezmail-ai-crx--${componentName}`,
)

import ChatGPTDaemonProcess from './pages/ChatGPTDaemonProcessPage'

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
  const container = document.createElement('div')
  container.id = 'EzMail_AI_ROOT'
  document.body.appendChild(container)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const root = createRoot(document.getElementById('EzMail_AI_ROOT'))
  root.render(
    <React.StrictMode>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </React.StrictMode>,
  )
}
