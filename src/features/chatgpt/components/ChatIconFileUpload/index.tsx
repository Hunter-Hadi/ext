import React, { FC, useMemo, useRef, useState } from 'react'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CancelIcon from '@mui/icons-material/Cancel'
const ChatIconFileUpload: FC<{
  accept?: string
  maxFileSize?: number
  maxFiles?: number
  disabled?: boolean
  children?: React.ReactNode
  direction?: 'row' | 'column'
  onUpload?: (files: IChatUploadFile[]) => void
  onDone?: (files: IChatUploadFile[]) => void
  size?: 'small' | 'medium' | 'large'
  sx?: SxProps
}> = (props) => {
  const {
    accept,
    maxFileSize,
    maxFiles = 1,
    disabled = false,
    direction = 'row',
    size = 'medium',
    sx,
  } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<IChatUploadFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string>('')
  const boxHeight = size === 'small' ? 24 : size === 'medium' ? 32 : 40
  const isMaxFiles = useMemo(() => {
    return files.length >= maxFiles
  }, [files])
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {
      return
    }
    const filesArray = Array.from(files)
    if (filesArray.length === 0) {
      return
    }
    if (isMaxFiles) {
      setError(`You can only upload ${maxFiles} files`)
      return
    }
    // fileSize
    if (maxFileSize) {
      const isOverSize = filesArray.some((file) => {
        return file.size > maxFileSize
      })
      if (isOverSize) {
        setError(`File size must be less than ${maxFileSize} bytes`)
        return
      }
    }
    // upload
    const uploadFiles = filesArray.map((file) => {
      // fileName: string
      // fileSize: number
      // fileType: string
      // fileUrl?: string
      // file?: File
      // uploadProgress?: number
      // uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
      // uploadErrorMessage?: string
      let icon = 'file'
      // image, svg, gif
      if (file.type.includes('image')) {
        icon = URL.createObjectURL(file)
      }
      return {
        id: file.name + file.size,
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadStatus: 'idle',
        error: null,
        progress: 0,
        icon,
      } as IChatUploadFile
    })
    setFiles((prev) => [...prev, ...uploadFiles])
  }
  // const hasFileUploading = useMemo(() => {
  //   return files.some((file) => file.uploadStatus === 'uploading')
  // }, [files])
  return (
    <Stack
      direction={direction}
      sx={{
        ...sx,
      }}
      spacing={1}
    >
      {files.map((file, index) => {
        const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32
        return (
          <Stack
            key={file.id}
            direction={'row'}
            position={'relative'}
            sx={{
              width: 2.5 * boxHeight,
              maxWidth: 2.5 * boxHeight,
            }}
            onMouseEnter={() => {
              setHoverId(file.id)
            }}
            onMouseLeave={() => {
              setHoverId('')
            }}
          >
            <Stack
              width={boxHeight}
              height={boxHeight}
              justifyContent={'center'}
              alignItems={'center'}
              flexShrink={0}
              sx={{
                borderRadius: '4px 0 0 4px',
              }}
            >
              {file.icon === 'file' ? (
                <Stack
                  alignItems={'center'}
                  justifyContent={'center'}
                  width={'100%'}
                  height={'100%'}
                  sx={{
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgb(142, 142, 159)'
                        : 'rgb(142, 142, 159)',
                    color: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.87)'
                        : 'rgba(255, 255, 255, 0.87)',
                  }}
                >
                  <ContextMenuIcon
                    icon={'InsertDriveFile'}
                    sx={{
                      color: 'inherit',
                      fontSize: `${iconSize}px`,
                    }}
                  />
                </Stack>
              ) : (
                <img
                  width={boxHeight}
                  height={boxHeight}
                  alt={file.fileName}
                  style={{
                    objectFit: 'cover',
                  }}
                  src={file.icon}
                />
              )}
            </Stack>
            <Stack
              sx={{
                borderRadius: '0 4px 4px 0',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgb(247, 247, 248)'
                    : 'rgb(247, 247, 248)',
              }}
              flex={1}
              width={0}
              alignItems={'center'}
              direction={'row'}
            >
              <TextOnlyTooltip placement={'top'} title={file.fileName}>
                <Typography
                  px={1}
                  noWrap
                  fontSize={'12px'}
                  width={'100%'}
                  fontWeight={600}
                  textAlign={'left'}
                  sx={{
                    color: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.87)'
                        : 'rgba(0, 0, 0, 0.87)',
                  }}
                >
                  {file.fileName}
                </Typography>
              </TextOnlyTooltip>
            </Stack>
            {hoverId !== file.id && (
              <Box top={-8} right={-8} position={'absolute'}>
                <TextOnlyTooltip placement={'top'} arrow title={'Remove file'}>
                  <Button
                    sx={{
                      minWidth: 'unset',
                      p: 0,
                      color: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(142,142,159, 1)'
                          : 'rgba(0, 0, 0, 0.87)',
                    }}
                    onClick={() => {}}
                  >
                    <CancelIcon
                      sx={{
                        color: 'inherit',
                      }}
                    />
                  </Button>
                </TextOnlyTooltip>
              </Box>
            )}
          </Stack>
        )
      })}
      {!isMaxFiles && (
        <TextOnlyTooltip placement={'top'} arrow title={'Upload file'}>
          <Button
            disabled={disabled}
            sx={{
              minWidth: 'unset',
              p: 0,
              my: '4px',
              color: 'text.primary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.click()
              }
            }}
          >
            <input
              multiple={maxFiles > 1}
              onChange={handleUpload}
              ref={inputRef}
              accept={accept || ''}
              hidden
              style={{
                display: 'none',
              }}
              type={'file'}
            />
            <ContextMenuIcon
              icon={'AddCircle'}
              sx={{
                color: 'inherit',
              }}
            />
          </Button>
        </TextOnlyTooltip>
      )}
    </Stack>
  )
}

export default ChatIconFileUpload
