import React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'
import AppThemeProvider from '@/components/AppTheme'
import { RecoilRoot } from 'recoil'
import OptionPagesInit from '@/utils/OptionPagesInit'
import SettingsApp from '@/pages/settings/pages/SettingsApp'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'
// init i18n
import '@/i18n'

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
