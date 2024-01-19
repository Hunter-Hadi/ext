import Stack from '@mui/material/Stack'
import React, { useState } from 'react'

import HomeViewAISearchInput from './HomeViewAISearchInput'
import HomeViewContentNav from './HomeViewContentNav'
import HomeViewPdfDropBox from './HomeViewPdfDropBox'

const SidebarHomeView = () => {
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

  const handleDrop = (event: any) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files as FileList
    // 处理拖放的文件
    console.log(files)
    debugger
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
    >
      {isDragOver ? (
        <HomeViewPdfDropBox />
      ) : (
        <Stack
          spacing={3}
          height="100%"
          justifyContent="center"
          alignItems="center"
          maxWidth={480}
        >
          <HomeViewAISearchInput />
          <HomeViewContentNav />
        </Stack>
      )}
    </Stack>
  )
}

export default SidebarHomeView
