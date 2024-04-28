import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getMaxAISidebarRootElement } from '@/utils'

interface IProps {
  sx?: SxProps
}

const MaxAIScreenshotMiniButton: FC<IProps> = ({ sx }) => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        width: 32,
        height: 32,
        borderRadius: '50%',
        ...sx,
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
              const screenshotBtn = getMaxAISidebarRootElement()?.querySelector(
                'button[data-testid="maxai-take-screenshot"]',
              ) as HTMLButtonElement
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
    </Stack>
  )
}
export default MaxAIScreenshotMiniButton
