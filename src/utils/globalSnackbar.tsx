import { createShadowRoot } from '@/utils/elementHelper'
import createCache from '@emotion/cache'
import { CacheProvider, ThemeProvider } from '@emotion/react'
import { IconButton } from '@mui/material'
import {
  OptionsObject,
  SnackbarMessage,
  SnackbarProvider,
  useSnackbar,
  WithSnackbarProps,
} from 'notistack'
import React from 'react'
import { createRoot } from 'react-dom/client'
import CloseIcon from '@mui/icons-material/Close'
import { RecoilRoot } from 'recoil'
import { useCustomTheme } from '@/hooks/useCustomTheme'

export const NAXAI_SNACKBAR_SHADOW_ROOT_ID = 'maxai-snackbar'

const MAXAI_SNACKBAR_SHADOW_CONTAINER_ID = 'maxai-snackbar-container'

let snackbarRef: WithSnackbarProps
const SnackbarUtilsConfigurator: React.FC = () => {
  snackbarRef = useSnackbar()
  return null
}

export const getSnackbarRef = () => snackbarRef

export const closeAllSnackbar = () => {
  if (snackbarRef && snackbarRef.closeSnackbar) {
    snackbarRef.closeSnackbar()
  }
}

export const getWebChatGPTSnackbarDocument = () => {
  return document
    .getElementById(NAXAI_SNACKBAR_SHADOW_ROOT_ID)
    ?.shadowRoot?.getElementById(
      MAXAI_SNACKBAR_SHADOW_CONTAINER_ID,
    ) as HTMLElement
}

export const ChatGPTSnackbarContainer = () => {
  const { customTheme } = useCustomTheme({ colorSchema: 'dark' })
  return (
    <ThemeProvider theme={customTheme}>
      <SnackbarProvider
        maxSnack={3}
        preventDuplicate
        hideIconVariant
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        action={(key) => (
          <IconButton
            onClick={() => {
              if (snackbarRef && snackbarRef.closeSnackbar) {
                snackbarRef.closeSnackbar(key)
              }
            }}
          >
            <CloseIcon fontSize="inherit" sx={{ color: 'white' }} />
          </IconButton>
        )}
      >
        <SnackbarUtilsConfigurator />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export const renderGlobalSnackbar = () => {
  // 在chatgpt 网页渲染一个 Snackbar components 用于显示提示信息
  const { container, shadowRoot, emotionRoot } = createShadowRoot({
    containerId: MAXAI_SNACKBAR_SHADOW_CONTAINER_ID,
    shadowRootId: NAXAI_SNACKBAR_SHADOW_ROOT_ID,
    presetContainerElement(shadowContainer) {
      shadowContainer.style.color = '#fff'
    },
  })
  container.style.zIndex = `2147483647`
  document.body.appendChild(shadowRoot)
  const emotionCache = createCache({
    key: `webchatgpt-snackbar-emotion-cache`,
    prepend: true,
    container: emotionRoot,
  })
  createRoot(container).render(
    <React.StrictMode>
      <RecoilRoot>
        <CacheProvider value={emotionCache}>
          <ChatGPTSnackbarContainer />
        </CacheProvider>
      </RecoilRoot>
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
