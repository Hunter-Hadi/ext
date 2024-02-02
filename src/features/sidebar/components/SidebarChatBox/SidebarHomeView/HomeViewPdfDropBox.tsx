import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const HomeViewPdfDropBox = () => {
  const { t } = useTranslation()

  return (
    <Stack
      spacing={1}
      justifyContent="center"
      alignItems="center"
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,

          border: '2px dashed',
          borderColor: 'primary.main',
          bgcolor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(244,235,251,0.8)',

          pointerEvents: 'none',
          color: 'text.secondary',
        }
      }}
    >
      <Stack direction={'row'} spacing={0.5}>
        <HomeViewContentNavIcons icon={'chat_with_pdf'} />
        <ImageOutlinedIcon />
      </Stack>
      <Typography fontSize={16} fontWeight={400} lineHeight={1.5}>
        {t('client:home_view_content_nav__drop_pdf_and_image_here')}
      </Typography>
    </Stack>
  )
}

export default HomeViewPdfDropBox
