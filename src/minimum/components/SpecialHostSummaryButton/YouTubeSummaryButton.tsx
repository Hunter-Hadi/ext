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
  const { element } = useFindElement('#top-row')
  const [renderElement, setRenderElement] = React.useState<HTMLElement | null>(
    null,
  )
  useEffect(() => {
    if (
      element &&
      !document.querySelector(`#${MAXAI_YOUTUBE_SUMMARY_BUTTON}`)
    ) {
      // 插入到element的nextSibling
      const nextElementSibling = element.nextElementSibling
      if (nextElementSibling) {
        const button = document.createElement('div')
        button.id = MAXAI_YOUTUBE_SUMMARY_BUTTON
        button.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: start;
          padding: 16px 0 0 0;
        `
        nextElementSibling.parentNode?.insertBefore(button, nextElementSibling)
        setRenderElement(button)
      }
    }
  }, [element])
  if (!renderElement) {
    return null
  }
  return (
    <DynamicComponent
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
