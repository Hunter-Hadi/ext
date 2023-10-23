import React, { FC, useEffect } from 'react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import DynamicComponent from '@/components/DynamicComponent'
import useFindElement from '@/hooks/useFindElement'

const YouTubeSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement(
    'ytd-watch-metadata #menu ytd-menu-renderer',
  )

  useEffect(() => {
    if (element) {
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
  }, [element])
  return (
    <DynamicComponent
      customElementName={'max-ai-youtube-summary-button'}
      rootContainer={element}
    >
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
    </DynamicComponent>
  )
}
export default YouTubeSummaryButton
