import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { MAXAI_MINIMIZE_CONTAINER_ID } from '@/features/common/constants'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

const MaxAIScreenshotMiniButton = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        width: 32,
        height: 32,
        borderRadius: '50%',
      }}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <TextOnlyTooltip
        arrow
        minimumTooltip
        title={t('client:sidebar__mini_button__screenshot__tooltip')}
        placement={'left'}
      >
        <Button
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            minWidth: 'unset',
            display: 'flex',
            color: 'primary.main',
            boxShadow:
              '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={(event) => {
            // showChatBox()
            const timer = setInterval(() => {
              const screenshotBtn = queryShadowContainerElementSelector<HTMLElement>(
                MAXAI_MINIMIZE_CONTAINER_ID,
                'button[data-testid="maxai-take-screenshot"]',
              )
              if (screenshotBtn) {
                clearInterval(timer)
                screenshotBtn.click()
              }
            }, 500)
          }}
        >
          <ContentCutOutlinedIcon
            sx={{
              transform: 'rotate(-90deg)',
              color: 'inherit',
              fontSize: '18px',
            }}
          />
        </Button>
      </TextOnlyTooltip>

      {/* 在 click MaxAIScreenshotMiniButton 时 通过找到下面这个隐藏的 SidebarScreenshotButton 组件触发 click 事件，来实现截图  */}
      <SidebarScreenshotButton
        sx={{
          position: 'absolute',
          display: 'none',
          visibility: 0,
          width: 0,
          height: 0,
          opacity: 0,
          zIndex: -1,
        }}
      />
    </Stack>
  )
}
export default MaxAIScreenshotMiniButton
