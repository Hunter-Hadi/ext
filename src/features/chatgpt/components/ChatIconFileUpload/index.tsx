import React, { FC, useMemo, useRef, useState } from 'react'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import useAIProviderUpload from '@/features/chatgpt/hooks/useAIProviderUpload'
import { v4 as uuidV4 } from 'uuid'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { ChatGPTConversationState } from '@/features/gmail/store'

const ChatIconFileUpload: FC<{
  accept?: string
  maxFileSize?: number
  maxFiles?: number
  disabled?: boolean
  children?: React.ReactNode
  direction?: 'row' | 'column'
  onUpload?: (files: IChatUploadFile[]) => void
  onDone?: (files: IChatUploadFile[]) => void
  size?: 'tiny' | 'small' | 'medium' | 'large'
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
  const {
    files,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
  } = useAIProviderUpload()
  const clientState = useRecoilValue(ChatGPTClientState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string>('')
  const boxHeight = {
    tiny: 24,
    small: 24,
    medium: 32,
    large: 40,
  }[size]
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
      let icon = 'file'
      // image, svg, gif
      if (file.type.includes('image')) {
        icon = URL.createObjectURL(file)
      }
      // id: string
      // fileName: string
      // fileSize: number
      // fileType: string
      // blobUrl?: string
      // icon?: string
      // file?: File
      // uploadProgress?: number
      // uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
      // uploadErrorMessage?: string
      // uploadedUrl?: string
      return {
        id: uuidV4(),
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        blobUrl: URL.createObjectURL(file),
        uploadStatus: 'idle',
        uploadErrorMessage: '',
        uploadProgress: 0,
        icon,
      } as IChatUploadFile
    })
    await aiProviderUploadFiles(uploadFiles)
    // clear input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  // const hasFileUploading = useMemo(() => {
  //   return files.some((file) => file.uploadStatus === 'uploading')
  // }, [files])
  if (
    !AIProviderConfig.isSupportedUpload ||
    clientState.status !== 'success' ||
    conversation.loading
  ) {
    return <></>
  }
  return (
    <Stack
      direction={direction}
      sx={{
        ...sx,
      }}
      spacing={1}
    >
      {files.map((file, index) => {
        const iconSize = {
          tiny: 16,
          small: 16,
          medium: 24,
          large: 32,
        }[size]
        const top = size === 'tiny' ? 2 : -8
        const right = size === 'tiny' ? 2 : -8
        const isHover = hoverId === file.id
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
                overflow: 'hidden',
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
                  style={
                    {
                      // objectFit: 'cover',
                    }
                  }
                  src={file.icon}
                />
              )}
            </Stack>
            <TextOnlyTooltip placement={'top'} title={error || file.fileName}>
              <Stack
                sx={{
                  overflow: 'hidden',
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
              </Stack>
            </TextOnlyTooltip>
            {!isHover && file.uploadStatus === 'uploading' && (
              <Stack
                top={top}
                right={right}
                position={'absolute'}
                width={20}
                height={20}
                alignItems={'center'}
                justifyContent={'center'}
                borderRadius={'10px'}
                sx={{
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgb(44, 44, 44)'
                      : 'rgb(255, 255, 255)',
                }}
              >
                <CircularProgress
                  sx={{
                    color: 'primary.main',
                  }}
                  thickness={4}
                  variant="determinate"
                  value={file.uploadProgress}
                  size={16}
                />
              </Stack>
            )}
            {isHover && (
              <Box top={top} right={right} position={'absolute'}>
                <TextOnlyTooltip placement={'top'} arrow title={'Remove file'}>
                  <Button
                    sx={{
                      minWidth: 'unset',
                      p: 0,
                      color: 'rgba(142,142,159, 1)',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                    onClick={async () => {
                      await aiProviderRemoveFiles([file])
                    }}
                  >
                    <ContextMenuIcon
                      icon={'CloseCircled'}
                      sx={{
                        fontSize: '20px',
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
            <ContextMenuIcon
              icon={'AddCircle'}
              sx={{
                color: 'inherit',
              }}
            />
          </Button>
        </TextOnlyTooltip>
      )}
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
    </Stack>
  )
}

export default ChatIconFileUpload
