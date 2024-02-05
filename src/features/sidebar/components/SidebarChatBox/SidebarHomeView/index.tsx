import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import HomeViewContentNav from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNav'
import HomeViewPdfDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewPdfDropBox'
import { useUploadImagesAndSwitchToVision } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

interface ISidebarHomeViewProps {
  sx?: SxProps
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({ sx }) => {
  const { t } = useTranslation(['client'])
  const { currentSidebarConversationType } = useSidebarSettings()
  const { uploadImagesAndSwitchToVision } = useUploadImagesAndSwitchToVision()

  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (event: any) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragOver = (event: any) => {
    event.preventDefault()
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (event: any) => {
    const file = event.dataTransfer.files[0]

    const isImage = file.type.includes('image')
    const isPDF = file.type.includes('pdf')

    if (isImage) {
      event.preventDefault()

      uploadImagesAndSwitchToVision([file])
    }

    if (isPDF) {
      event.stopPropagation()
      // do nothing
      // 用浏览器的默认打开文件行为来打开 pdf 文件，然后 插件会代理 pdf 文件预览 转为 maxai pdf viewer
    }

    setIsDragOver(false)
  }
  if (currentSidebarConversationType === 'Chat') {
    return (
      <Stack
        px={2}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        position="relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={sx}
      >
        {isDragOver ? (
          <HomeViewPdfDropBox />
        ) : (
          <Stack height="100%" alignItems="center" maxWidth={480}>
            <HomeViewContentNav />
          </Stack>
        )}
      </Stack>
    )
  }
  if (currentSidebarConversationType === 'Search') {
    return (
      <Stack
        px={2}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={sx}
      >
        <Stack justifyContent={'center'} alignItems={'center'}>
          <ContextMenuIcon
            icon={'Search'}
            sx={{
              color: 'primary.main',
              fontSize: '48px',
            }}
          />
          <Typography
            mt={1.5}
            mb={1}
            fontSize={'20px'}
            fontWeight={700}
            textAlign={'center'}
            color={'text.primary'}
          >
            {t('client:home_view__search__title')}
          </Typography>
          <Typography
            fontSize={'14px'}
            fontWeight={400}
            textAlign={'center'}
            color={'text.primary'}
          >
            {t('client:home_view__search__description')}
          </Typography>
        </Stack>
      </Stack>
    )
  }
  if (currentSidebarConversationType === 'Art') {
    return (
      <Stack
        px={2}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={sx}
      >
        <Stack justifyContent={'center'} alignItems={'center'}>
          <ContextMenuIcon
            icon={'Art'}
            sx={{
              color: 'primary.main',
              fontSize: '48px',
            }}
          />
          <Typography
            mt={1.5}
            mb={1}
            fontSize={'20px'}
            fontWeight={700}
            textAlign={'center'}
            color={'text.primary'}
          >
            {t('client:home_view__art__title')}
          </Typography>
          <Typography
            fontSize={'14px'}
            fontWeight={400}
            textAlign={'center'}
            color={'text.primary'}
          >
            {t('client:home_view__art__description')}
          </Typography>
        </Stack>
      </Stack>
    )
  }
  return null
}

export default SidebarHomeView
