import Button from '@mui/material/Button'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import useFindElement from '@/features/common/hooks/useFindElement'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAISidebarRootElement } from '@/utils'

const MAXAI_YOUTUBE_SUMMARY_BUTTON = 'max-ai-youtube-summary-button'
const YouTubeSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement(
    'ytd-watch-metadata div#title h1 yt-formatted-string',
  )
  const [renderElement, setRenderElement] = React.useState<HTMLElement | null>(
    null,
  )

  const [summaryButtonContainer, setSummaryButtonContainer] =
    React.useState<HTMLElement | null>(null)

  const buttonTooltipKey = useMemo(() => {
    const summaryType = getPageSummaryType()
    switch (summaryType) {
      case 'DEFAULT_EMAIL_SUMMARY':
        return 'client:sidebar__tabs__summary__tooltip__default_email'
      case 'PAGE_SUMMARY':
        return 'client:sidebar__tabs__summary__tooltip__page'
      case 'PDF_CRX_SUMMARY':
        return 'client:sidebar__tabs__summary__tooltip__pdf_crx'
      case 'YOUTUBE_VIDEO_SUMMARY':
        return 'client:sidebar__tabs__summary__tooltip__youtube_video'
      default:
        return 'client:sidebar__tabs__summary__tooltip__page'
    }
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (element && element?.innerText?.length > 0) {
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
      }, 0)
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
      onSetContainer={setSummaryButtonContainer}
    >
      <TextOnlyTooltip
        arrow
        PopperProps={{
          disablePortal: true,
        }}
        title={t(buttonTooltipKey)}
        placement={'left'}
      >
        <Button
          sx={{
            borderRadius: '18px',
          }}
          data-testid='maxai-youtube-summary-button'
          onClick={() => {
            showChatBox()
            const timer = setInterval(() => {
              if (
                getMaxAISidebarRootElement()?.querySelector(
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
      </TextOnlyTooltip>
      {summaryButtonContainer && (
        <OnboardingTooltipPortal
          sceneType='YOUTUBE_SUMMARY_BUTTON'
          container={summaryButtonContainer}
        />
      )}
    </DynamicComponent>
  )
}
export default YouTubeSummaryButton
