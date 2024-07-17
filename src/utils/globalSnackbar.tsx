import {
  OptionsObject,
  ProviderContext as SnackbarProviderContext,
  SnackbarMessage,
  SnackbarProvider,
  useSnackbar,
  // WithSnackbarProps,
} from 'notistack'
import React from 'react'
import { createRoot } from 'react-dom/client'

export const MAXAI_SNACKBAR_SHADOW_ROOT_ID = 'MAXAI_SNACKBAR_ROOT'

const MAXAI_SNACKBAR_SHADOW_CONTAINER_ID = 'MAXAI_SNACKBAR_CONTAINER'

let snackbarRef: SnackbarProviderContext
const SnackbarUtilsConfiguration: React.FC = () => {
  snackbarRef = useSnackbar()
  return null
}

export const getSnackbarRef = () => snackbarRef

export const closeAllSnackbar = () => {
  if (snackbarRef && snackbarRef.closeSnackbar) {
    snackbarRef.closeSnackbar()
  }
}

export const getGlobalSnackbarDocument = () => {
  return document.getElementById(MAXAI_SNACKBAR_SHADOW_CONTAINER_ID)
}

export const ChatGPTSnackbarContainer = () => {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      hideIconVariant
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      classes={{
        containerRoot: 'maxai-snackbar-container-root',
      }}
      action={(key) => (
        <svg
          focusable='false'
          aria-hidden='true'
          viewBox='0 0 24 24'
          style={{
            width: '1em',
            height: '1em',
            display: 'inline-block',
            fill: 'currentcolor',
            fontSize: 18,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (snackbarRef && snackbarRef.closeSnackbar) {
              snackbarRef.closeSnackbar(key)
            }
          }}
        >
          <path d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'></path>
        </svg>
      )}
    >
      <SnackbarUtilsConfiguration />
    </SnackbarProvider>
  )
}

export const renderGlobalSnackbar = () => {
  const container = document.createElement('div')
  container.id = MAXAI_SNACKBAR_SHADOW_CONTAINER_ID
  container.style.zIndex = `21474836470`
  container.style.color = '#fff'
  container.style.position = 'absolute'
  document.body.appendChild(container)
  createRoot(container).render(
    <React.StrictMode>
      <ChatGPTSnackbarContainer />
    </React.StrictMode>,
  )
}

const toast = (msg: SnackbarMessage, options: OptionsObject = {}): void => {
  snackbarRef.enqueueSnackbar(msg, options)
}

const success = (msg: SnackbarMessage, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'success' })
}
const warning = (msg: SnackbarMessage, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'warning' })
}
const info = (msg: SnackbarMessage, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'info' })
}
const error = (msg: SnackbarMessage, options: OptionsObject = {}): void => {
  toast(msg, { ...options, variant: 'error' })
}

const exportedObject = {
  success,
  warning,
  info,
  error,
}

export default exportedObject
