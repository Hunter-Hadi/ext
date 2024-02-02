import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import UploadButton from '@/features/common/components/UploadButton'
import HomeViewContentNavIcons from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNavIcons'
import { useUploadImagesAndSwitchToVision } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import { chromeExtensionClientOpenPage } from '@/utils'

const HomeViewFileUploader = () => {
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
          cursor: 'pointer',
          borderRadius: 2,
          // transition: 'all 0.3s ease',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',
          border: '1px dashed',
          borderColor: 'customColor.borderColor',
          height: '100%',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.10)',
          },
        }
      }}
    >
      <Stack
        direction={'row'}
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mb={1}
      >
        <HomeViewContentNavIcons icon={'chat_with_pdf'} />
        <HomeViewContentNavIcons icon={'drop_image'} />
      </Stack>

      <UploadButton
        startIcon={<UploadFileOutlinedIcon />}
        accept="image/*,.pdf"
        variant="secondary"
        sx={{
          mb: 0.5,
          color: 'text.secondary',
          px: 1.5,
          py: 0.75,
          lineHeight: 1.4,
          borderRadius: 2,
        }}
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0) {
            await handleUploadFiles(e.target.files[0])
            // reset
            e.target.value = ''
          }
        }}
      >
        {t('client:home_view_content_nav__choose_file')}
      </UploadButton>

      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color="inherit"
      >
        {t('client:home_view_content_nav__drop_here_text')}
      </Typography>
    </Stack>
  )
}

export default HomeViewFileUploader
