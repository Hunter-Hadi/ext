import { buttonClasses } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useUploadImagesAndSwitchToVision } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import { chromeExtensionClientOpenPage } from '@/utils'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const HomeViewPDFUploader = () => {
  const { t } = useTranslation(['client'])

  // const {
  //   files,
  //   AIProviderConfig,
  //   aiProviderUploadFiles,
  // } = useAIProviderUpload()

  const { uploadImagesAndSwitchToVision } = useUploadImagesAndSwitchToVision()

  const handleUploadFiles = async (file: File) => {
    const isImage = file.type.includes('image')
    const isPDF = file.type.includes('pdf')
    if (isImage) {
      uploadImagesAndSwitchToVision([file])
    }

    if (isPDF) {
      chromeExtensionClientOpenPage({
        key: 'pdf_viewer',
        query: '?pdfUrl=&newTab=true',
      })
    }
  }

  return (
    <Stack
      alignItems="center"
      justifyContent={'center'}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          p: 1,
          color: 'text.primary',
          borderRadius: 2,
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',
          border: '1px dashed',
          borderColor: 'customColor.borderColor',
          height: '100%',
        }
      }}
    >
      <Stack
        direction={'row'}
        alignItems="center"
        spacing={0.5}
        sx={(t) => {
          const isDark = t.palette.mode === 'dark'
          return {
            p: 1,
            cursor: 'pointer',
            borderRadius: 2,
            color: 'text.secondary',
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.08)',

            [`.${buttonClasses.startIcon}`]: {
              ml: 0,
              mr: 0.5,
            },

            '&:hover': {
              bgcolor: isDark
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.1)',
              color: isDark
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(0, 0, 0, 0.38)',
            },
          }
        }}
        onClick={() => {
          chromeExtensionClientOpenPage({
            key: 'pdf_viewer',
            query: '?pdfUrl=&newTab=true',
          })
        }}
      >
        <HomeViewContentNavIcons icon={'chat_with_pdf'} />
        <Typography
          fontSize={14}
          fontWeight={500}
          lineHeight={1.5}
          color="inherit"
        >
          {t('client:home_view_content_nav__pdf_uploader__chat_with_pdf')}
        </Typography>
      </Stack>

      <Typography
        fontSize={12}
        fontWeight={400}
        lineHeight={1.5}
        color="inherit"
      >
        {t('client:home_view_content_nav__pdf_uploader__drop_pdf_here')}
      </Typography>
    </Stack>
  )
}

export default HomeViewPDFUploader
