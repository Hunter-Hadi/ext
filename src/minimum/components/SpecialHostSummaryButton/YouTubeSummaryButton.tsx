import Button from '@mui/material/Button'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import { getAppRootElement } from '@/features/common/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import useFindElement from '@/hooks/useFindElement'
import { showChatBox } from '@/utils'

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
    let timer: ReturnType<typeof setTimeout> | null = null
    if (element) {
      console.log('useFindElement', '2222')
      // 插入到element的nextSibling
      const button = document.createElement('div')
      button.className = MAXAI_YOUTUBE_SUMMARY_BUTTON
      button.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: start;
          margin-left: auto;
          flex-shrink: 0;
        `
      timer = setTimeout(() => {
        const parent = element.parentNode as HTMLElement
        console.log('useFindElement', '3333')
        if (parent) {
          console.log('useFindElement', '4444')
          parent.style.cssText += `display: flex;align-items: center;gap: 8px;`
          element.parentNode?.append(button)
        }
        setRenderElement(button)
      }, 3000)
    } else {
      const prevButtons = Array.from(
        document.querySelectorAll(`.${MAXAI_YOUTUBE_SUMMARY_BUTTON}`),
      ) as HTMLDivElement[]
      prevButtons.filter((prevButton) => {
        prevButton.remove()
      })
      setRenderElement(null)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
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
