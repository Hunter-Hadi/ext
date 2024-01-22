import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'

import HomeViewContentNav from './HomeViewContentNav'
import HomeViewPdfDropBox from './HomeViewPdfDropBox'

interface ISidebarHomeViewProps {
  sx?: SxProps
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({ sx }) => {
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
    // event.preventDefault()
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
