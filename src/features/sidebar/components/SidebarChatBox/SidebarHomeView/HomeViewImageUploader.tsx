import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { buttonClasses } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import UploadButton from '@/features/common/components/UploadButton'
import { useUploadImagesAndSwitchToVision } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import { chromeExtensionClientOpenPage } from '@/utils'

import HomeViewAIScreenshotButton from './HomeViewAIScreenshotButton'

const HomeViewImageUploader = () => {
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
          // transition: 'all 0.3s ease',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',
          border: '1px dashed',
          borderColor: 'customColor.borderColor',
          height: '100%',
        }
      }}
    >
      <Stack spacing={0.5}>
        <UploadButton
          startIcon={<ImageOutlinedIcon />}
          accept="image/*"
          variant="secondary"
          sx={{
            color: 'text.secondary',
            px: 1.5,
            py: 1,
            borderRadius: 2,

            [`.${buttonClasses.startIcon}`]: {
              mr: 0.5,
              ml: 0,
            },
          }}
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              await handleUploadFiles(e.target.files[0])
              // reset
              e.target.value = ''
            }
          }}
        >
          {t('client:home_view_content_nav__image_uploader__choose_image')}
        </UploadButton>

        <HomeViewAIScreenshotButton />
      </Stack>

      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color="text.secondary"
        mt={'2px'}
      >
        {t('client:home_view_content_nav__image_uploader__drop_image_here')}
      </Typography>
    </Stack>
  )
}

export default HomeViewImageUploader
