import React from 'react'
import EzMailOptionsPage from '@/pages/options/pages/EzMailOptionsPage'
import UseChatGPTOptionsPage from '@/pages/options/pages/UseChatGPTOptionsPage'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'
import AppThemeProvider from '@/components/AppTheme'
import { RecoilRoot } from 'recoil'
import OptionPagesInit from '@/utils/OptionPagesInit'
import { isEzMailApp } from '@/constants'

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)

  document.title = isEzMailApp ? `Settings | EzMail.AI` : `Settings | MaxAI.me`

  root.render(
    <React.StrictMode>
      <RecoilRoot>
        <AppThemeProvider>
          <OptionPagesInit />
          <CssBaseline />
          {isEzMailApp ? <EzMailOptionsPage /> : <UseChatGPTOptionsPage />}
        </AppThemeProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
