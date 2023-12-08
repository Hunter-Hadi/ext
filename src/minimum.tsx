import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

import AppThemeProvider from '@/components/AppTheme'
import {
  APP_VERSION,
  MAXAI_CHROME_EXTENSION_ID,
  ROOT_MINIMIZE_CONTAINER_ID,
} from '@/constants'

const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')

import('@/minimum/MinimumApp').then((module) => {
  const { default: MinimumApp } = module
  const isSupportWebComponent = 'customElements' in window
  const minimumAppRoot = document.createElement(
    isSupportWebComponent ? 'max-ai-minimum-app' : 'div',
  )
  minimumAppRoot.id = ROOT_MINIMIZE_CONTAINER_ID
  minimumAppRoot.setAttribute('data-version', APP_VERSION)
  document.body.appendChild(minimumAppRoot)
  const shadowContainer = minimumAppRoot.attachShadow({ mode: 'open' })
  const emotionRoot = document.createElement('style')
  const shadowRootElement = document.createElement('div')
  shadowContainer.appendChild(emotionRoot)
  shadowContainer.appendChild(shadowRootElement)
  const cache = createCache({
    key: `${AppNameToClassName}-emotion-cache`,
    prepend: true,
    container: emotionRoot,
  })
  createRoot(shadowRootElement).render(
    <React.StrictMode>
      <RecoilRoot>
        <CacheProvider value={cache}>
          <AppThemeProvider shadowRootElement={shadowRootElement}>
            <MinimumApp />
          </AppThemeProvider>
        </CacheProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
})
