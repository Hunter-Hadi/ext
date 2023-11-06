import React, { FC, useEffect } from 'react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import DynamicComponent from '@/components/DynamicComponent'
import useFindElement from '@/hooks/useFindElement'

const MAXAI_YOUTUBE_SUMMARY_BUTTON = 'max-ai-youtube-summary-button'
const YouTubeSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement(
    'ytd-watch-metadata div#title h1 yt-formatted-string',
  )
  const [renderElement, setRenderElement] = React.useState<HTMLElement | null>(
    null,
  )
  useEffect(() => {
    const prevButton = document.querySelector(
      `#${MAXAI_YOUTUBE_SUMMARY_BUTTON}`,
    )
    if (element) {
      if ((prevButton?.childNodes || 0) > 0) {
        return
      } else if (prevButton) {
        prevButton.remove()
      }
      // 插入到element的nextSibling
      const button = document.createElement('div')
      button.id = MAXAI_YOUTUBE_SUMMARY_BUTTON
      button.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: start;
          margin-left: auto;
          flex-shrink: 0;
        `
      setTimeout(() => {
        const parent = element.parentNode as HTMLElement
        if (parent) {
          parent.style.cssText += `display: flex;align-items: center;gap: 8px;`
          element.parentNode?.append(button)
        }
        setRenderElement(button)
      }, 5000)
    }
  }, [element])
  if (!renderElement) {
    return null
  }
  return (
    <DynamicComponent
      checkVisibility={false}
      customElementName={'max-ai-youtube-summary-button'}
      rootContainer={renderElement}
    >
      <Button
        sx={{
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
