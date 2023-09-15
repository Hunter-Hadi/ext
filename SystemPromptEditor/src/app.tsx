import React, { FC } from 'react'
import ReactDOM from 'react-dom/client'
import Container from '@mui/material/Container'
import SystemPromptEditor from './SystemPromptEditor'

const App: FC = () => {
  return (
    <Container>
      <SystemPromptEditor />
    </Container>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
