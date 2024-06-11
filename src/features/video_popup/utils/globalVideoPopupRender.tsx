import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'

import AppThemeProvider from '@/components/AppTheme'
import { MAXAI_CHROME_EXTENSION_ID } from '@/features/common/constants'
import {
  MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
  MAXAI_GLOBAL_VIDEO_POPUP_WRAPPER_ID,
} from '@/features/video_popup/constant'
import { isSupportWebComponent } from '@/utils/dataHelper/elementHelper'
import SPARootProtector from '@/utils/SPARootProtector'

const supportWebComponent = isSupportWebComponent()

const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')

export const globalVideoPopupRender = () => {
  const GlobalVideoPopup = React.lazy(
    () => import('../components/GlobalVideoPopup'),
  )
  const PermissionPricingModal = React.lazy(
    () => import('@/features/auth/components/PermissionPricingModal'),
  )

  const container = document.createElement(
    supportWebComponent ? 'use-chat-gpt-ai' : 'div',
  )
  container.id = MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID
  document.body.appendChild(container)

  const shadowContainer = container.attachShadow({ mode: 'open' })
  const emotionRoot = document.createElement('style')
  const shadowRootElement = document.createElement('div')

  shadowRootElement.id = MAXAI_GLOBAL_VIDEO_POPUP_WRAPPER_ID
  shadowRootElement.style.position = 'absolute'
  shadowRootElement.style.zIndex = '2147483630'

  shadowContainer.appendChild(emotionRoot)
  shadowContainer.appendChild(shadowRootElement)

  const cache = createCache({
    key: `${AppNameToClassName}-emotion-cache`,
    prepend: true,
    container: emotionRoot,
  })

  const root = createRoot(shadowRootElement)

  SPARootProtector.addProtectedRoot({
    rootId: MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
    reactRoot: root,
    renderFn: globalVideoPopupRender,
  })

  root.render(
    <React.StrictMode>
      <RecoilRoot>
        <CacheProvider value={cache}>
          <AppThemeProvider shadowRootElement={shadowRootElement}>
            <GlobalVideoPopup />

            {/* TODO：临时放在这，后面可以拆出globalPopupRender专门存放全局弹窗组件 */}
            <PermissionPricingModal />
          </AppThemeProvider>
        </CacheProvider>
      </RecoilRoot>
    </React.StrictMode>,
  )
}
