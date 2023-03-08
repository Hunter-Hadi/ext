import React from 'react'
import OptionsPage from '@/pages/OptionsPage'
import CssBaseline from '@mui/material/CssBaseline'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('Root')

if (rootElement) {
  const root = createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <CssBaseline />
      <OptionsPage />
    </React.StrictMode>,
  )
}
