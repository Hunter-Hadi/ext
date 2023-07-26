import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'
import AppThemeProvider from '@/components/AppTheme'
import { RecoilRoot } from 'recoil'
import OptionPagesInit from '@/utils/OptionPagesInit'
import SettingsApp from '@/pages/settings/pages/SettingsApp'
import { SnackbarProvider } from 'notistack'
// init i18n
import '@/utils/i18n'

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)

  document.title = `Settings | MaxAI.me`

  root.render(
    <React.StrictMode>
      <RecoilRoot>
        <AppThemeProvider>
          <OptionPagesInit />
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <SettingsApp />
          </SnackbarProvider>
        </AppThemeProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
