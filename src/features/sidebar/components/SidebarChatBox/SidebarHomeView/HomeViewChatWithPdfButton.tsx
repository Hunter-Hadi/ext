import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { chromeExtensionClientOpenPage } from '@/utils'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const HomeViewChatWithPdfButton = () => {
  const { t } = useTranslation(['client'])

  const handleClick = () => {
    chromeExtensionClientOpenPage({
      key: 'pdf_viewer',
      query: '?pdfUrl=&newTab=true',
    })
  }

  return (
    <Stack
      direction={'row'}
      alignItems='center'
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
      <HomeViewContentNavIcons icon={'chat_with_pdf'} />
      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color='inherit'
      >
        {t('client:home_view_content_nav__chat_with_pdf_title')}
      </Typography>
    </Stack>
  )
}

export default HomeViewChatWithPdfButton
