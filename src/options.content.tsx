import React from 'react'
import EzMailOptionsPage from '@/pages/EzMailOptionsPage'
import UseChatGPTOptionsPage from '@/pages/useChatGPTOptionsPage'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'
import customMuiTheme from '@/pages/customMuiTheme'
import { ThemeProvider } from '@mui/material'
// import { RecoilRoot } from 'recoil'

const rootElement = document.getElementById('Root')

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <CssBaseline />
      {/* <RecoilRoot> */}
      <ThemeProvider theme={customMuiTheme()}>
        {isEzMailApp ? <EzMailOptionsPage /> : <UseChatGPTOptionsPage />}
      </ThemeProvider>
      {/* </RecoilRoot> */}
    </React.StrictMode>,
  )
}
