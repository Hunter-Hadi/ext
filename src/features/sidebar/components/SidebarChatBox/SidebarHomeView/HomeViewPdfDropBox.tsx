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
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        border: '2px dashed',
        borderColor: 'primary.main',
        bgcolor: 'rgba(244,235,251,1)',

        pointerEvents: 'none',
        color: 'text.secondary',
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
