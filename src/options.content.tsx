import React from 'react'
import OptionsPage from '@/pages/OptionsPage'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'
import customMuiTheme from '@/pages/customMuiTheme'
import { ThemeProvider } from '@mui/material'

const rootElement = document.getElementById('Root')

if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={customMuiTheme()}>
        <OptionsPage />
      </ThemeProvider>
    </React.StrictMode>,
  )
}
