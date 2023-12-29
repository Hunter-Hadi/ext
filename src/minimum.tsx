import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

import AppThemeProvider from '@/components/AppTheme'
import { APP_VERSION } from '@/constants'
import {
  MAXAI_CHROME_EXTENSION_ID,
  MAXAI_MINIMIZE_CONTAINER_ID,
} from '@/features/common/constants'

import SPARootProtector from './utils/SPARootProtector'

const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')

function minimumAppRender() {
  import('@/minimum/MinimumApp').then((module) => {
    const { default: MinimumApp } = module
    const isSupportWebComponent = 'customElements' in window
    const minimumAppRoot = document.createElement(
      isSupportWebComponent ? 'max-ai-minimum-app' : 'div',
    )
    minimumAppRoot.id = MAXAI_MINIMIZE_CONTAINER_ID
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

    const root = createRoot(shadowRootElement)

    SPARootProtector.addProtectedRoot({
      rootId: MAXAI_MINIMIZE_CONTAINER_ID,
      reactRoot: root,
      renderFn: minimumAppRender,
    })

    root.render(
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
}

minimumAppRender()
