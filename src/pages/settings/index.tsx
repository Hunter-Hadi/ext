// init i18n
import '@/i18n'

import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

import AppThemeProvider from '@/components/AppTheme'
import SettingsApp from '@/pages/settings/pages/SettingsApp'
import OptionPagesInit from '@/utils/OptionPagesInit'

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = createRoot(rootElement)
  const queryClient = new QueryClient()
  document.title = `Settings | MaxAI.me`
  root.render(
    <React.StrictMode>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <OptionPagesInit />
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
              <SettingsApp />
            </SnackbarProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
