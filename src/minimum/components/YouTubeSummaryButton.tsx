import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
const AppNameToClassName = String(process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
const YouTubeSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  /**
   * Create the modal container element that we'll put the children in.
   * Also make sure the documentElement has the modal root element inserted
   * so that we do not have to manually insert it into our HTML.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      const rootContainer = document.querySelector(
        'ytd-watch-metadata #menu ytd-menu-renderer',
      )

      if (rootContainer) {
        const isSupportWebComponent = 'customElements' in window
        const container = document.createElement(
          isSupportWebComponent ? 'maxai-youtube-summary-button' : 'div',
        )
        rootContainer.insertBefore(container, rootContainer.firstChild)
        const shadowContainer = container.attachShadow({ mode: 'open' })
        const emotionRoot = document.createElement('style')
        const shadowRootElement = document.createElement('div')
        shadowContainer.appendChild(emotionRoot)
        shadowContainer.appendChild(shadowRootElement)
        emotionCacheRef.current = createCache({
          key: `${AppNameToClassName}-ytb-summary-button`,
          prepend: true,
          container: emotionRoot,
        })
        setContainer(shadowRootElement)
        clearInterval(timer)
      }
    }, 1000)
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [])
  useEffect(() => {
    if (container) {
      setTimeout(() => {
        const youtubeApp = document.querySelector('ytd-app') as HTMLElement
        if (youtubeApp) {
          // resize 网页宽度，不然会有bug
          const originWidth = youtubeApp.getBoundingClientRect().width
          youtubeApp.style.width = `${originWidth - 1}px`
          setTimeout(() => {
            youtubeApp.style.width = ''
          }, 100)
        }
      }, 1000)
    }
  }, [container])
  if (!container || !emotionCacheRef.current) {
    return null
  }
  return createPortal(
    <CacheProvider value={emotionCacheRef.current}>
      <Button
        sx={{
          mr: 1,
          borderRadius: '18px',
        }}
        onClick={() => {
          showChatBox()
          const timer = setInterval(() => {
            if (
              getAppRootElement()?.querySelector(
                'p[data-testid="max-ai__summary-tab"]',
              )
            ) {
              clearInterval(timer)
              window.dispatchEvent(
                new CustomEvent('MaxAISwitchSidebarTab', {
                  detail: {
                    type: 'Summary' as ISidebarConversationType,
                  },
                }),
              )
            }
          }, 500)
        }}
        variant={'contained'}
        startIcon={
          <UseChatGptIcon
            sx={{
              fontSize: 16,
              color: 'inherit',
            }}
          />
        }
      >
        {t('client:youtube_summary_button__text')}
      </Button>
    </CacheProvider>,
    container,
  )
}
export default YouTubeSummaryButton
