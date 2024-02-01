import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_APP_ROOT_ID } from '@/features/common/constants'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const HomeViewAIScreenshotButton = () => {
  const { t } = useTranslation(['common'])

  const handleClick = () => {
    const timer = setInterval(() => {
      const screenshotBtn = queryShadowContainerElementSelector<HTMLElement>(
        MAXAI_APP_ROOT_ID,
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
      alignItems="center"
      spacing={0.5}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          p: 1,
          color: 'text.primary',
          cursor: 'pointer',
          borderRadius: 2,
          // transition: 'all 0.3s ease',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.10)',
          },
        }
      }}
      onClick={handleClick}
    >
      <HomeViewContentNavIcons icon={'screenshot'} />
      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color="inherit"
      >
        {t('common:screenshot')}
      </Typography>
    </Stack>
  )
}

export default HomeViewAIScreenshotButton
