import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'

import useAIProviderUpload from '@/features/chatgpt/hooks/useAIProviderUpload'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import HomeViewContentNav from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNav'
import HomeViewPdfDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewPdfDropBox'

interface ISidebarHomeViewProps {
  sx?: SxProps
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({ sx }) => {
  const {
    files,
    AIProviderConfig,
    aiProviderUploadFiles,
  } = useAIProviderUpload()
  const maxFileSize = AIProviderConfig?.maxFileSize

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
      const newUploadFiles = await formatClientUploadFiles([file], maxFileSize)
      aiProviderUploadFiles(files.concat(newUploadFiles))
    }

    if (isPDF) {
      event.stopPropagation()
      // do nothing
      // 用浏览器的默认打开文件行为来打开 pdf 文件，然后 插件会代理 pdf 文件预览 转为 maxai pdf viewer
    }

    setIsDragOver(false)
  }

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

export default SidebarHomeView
