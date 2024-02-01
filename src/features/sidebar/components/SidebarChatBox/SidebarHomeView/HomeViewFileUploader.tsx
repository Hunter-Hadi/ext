import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useAIProviderUpload from '@/features/chatgpt/hooks/useAIProviderUpload'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import HomeViewContentNavIcons from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNavIcons'
import { chromeExtensionClientOpenPage } from '@/utils'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

const HomeViewFileUploader = () => {
  const { t } = useTranslation(['client'])

  const {
    files,
    AIProviderConfig,
    aiProviderUploadFiles,
  } = useAIProviderUpload()
  const maxFileSize = AIProviderConfig?.maxFileSize

  const handleUploadFiles = async (file: File) => {
    const isImage = file.type.includes('image')
    const isPDF = file.type.includes('pdf')
    if (isImage) {
      const newUploadFiles = await formatClientUploadFiles([file], maxFileSize)

      aiProviderUploadFiles(files.concat(newUploadFiles))
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

      <Button
        startIcon={<UploadFileOutlinedIcon />}
        variant="secondary"
        component="label"
        sx={{
          mb: 0.5,
          color: 'text.secondary',
          px: 1.5,
          py: 0.75,
          lineHeight: 1.4,
          borderRadius: 2,
        }}
      >
        {t('client:home_view_content_nav__choose_file')}
        <VisuallyHiddenInput
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            if (e.target.files) {
              handleUploadFiles(e.target.files[0])
            }
          }}
        />
      </Button>

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
