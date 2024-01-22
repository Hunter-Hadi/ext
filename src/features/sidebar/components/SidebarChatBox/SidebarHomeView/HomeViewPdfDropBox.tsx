import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import upperFirst from 'lodash-es/upperFirst'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
      // onDragEnter={handleDragEnter}
      // onDragOver={handleDragOver}
      // onDragLeave={handleDragLeave}
      // onDrop={handleDrop}
    >
      <UploadFileOutlinedIcon />
      <Typography>
        {upperFirst(t('client:home_view_content_nav__upload'))}
      </Typography>
    </Stack>
  )
}

export default HomeViewPdfDropBox
