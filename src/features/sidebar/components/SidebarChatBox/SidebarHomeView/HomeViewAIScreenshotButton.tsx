import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_APP_ROOT_ID } from '@/features/common/constants'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const HomeViewAIScreenshotButton: FC = () => {
  const { t } = useTranslation(['common'])

  const handleClick = () => {
    const timer = setInterval(() => {
      const screenshotBtn = queryShadowContainerElementSelector<HTMLElement>(
        `#${MAXAI_APP_ROOT_ID}`,
        'button[data-testid="maxai-take-screenshot"]',
      )
      if (screenshotBtn) {
        clearInterval(timer)
        screenshotBtn.click()
      }
    }, 500)
  }

  return (
    <Stack
      direction={'row'}
      alignItems='center'
      spacing={0.5}
      data-button-clicked-name='home-view-ai-screenshot-button'
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          cursor: 'pointer',
          borderRadius: 2,
          color: 'text.secondary',
          px: 1.5,
          py: 1,
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          '&:hover': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.38)',
          },
        }
      }}
      onClick={handleClick}
    >
      <HomeViewContentNavIcons
        icon={'screenshot'}
        sx={{
          p: 0,
          fontSize: 20,
        }}
      />
      <Typography
        fontSize={14}
        fontWeight={500}
        lineHeight={1.5}
        color='inherit'
      >
        {t('common:ai_screenshot')}
      </Typography>
    </Stack>
  )
}

export default HomeViewAIScreenshotButton
