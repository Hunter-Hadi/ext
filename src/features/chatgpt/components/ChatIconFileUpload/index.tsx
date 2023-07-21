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
import { ChatGPTConversationState } from '@/features/sidebar/store'

const ChatIconFileUpload: FC<{
  disabled?: boolean
  children?: React.ReactNode
  direction?: 'row' | 'column'
  onUpload?: (files: IChatUploadFile[]) => void
  onDone?: (files: IChatUploadFile[]) => void
  size?: 'tiny' | 'small' | 'medium' | 'large'
  sx?: SxProps
}> = (props) => {
  const { disabled = false, direction = 'row', size = 'medium', sx } = props
  const {
    files,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
    aiProviderUploadingTooltip,
  } = useAIProviderUpload()
  const clientState = useRecoilValue(ChatGPTClientState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hoverId, setHoverId] = useState<string>('')
  const boxHeight = {
    tiny: 24,
    small: 24,
    medium: 32,
    large: 40,
  }[size]
  const maxFiles = AIProviderConfig?.maxCount || 1
  const maxFileSize = AIProviderConfig?.maxFileSize || 5 * 1024 * 1024 // 5MB
  const isMaxFiles = useMemo(() => {
    return files.length >= (AIProviderConfig?.maxCount || 1)
  }, [files])
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const existFilesCount = files?.length || 0
    const canUploadCount = maxFiles - existFilesCount
    const selectedUploadFiles = e.target.files
    if (!selectedUploadFiles || canUploadCount === 0) {
      return
    }
    let filesArray = Array.from(selectedUploadFiles)
    filesArray = filesArray.slice(0, canUploadCount)
    if (filesArray.length === 0) {
      return
    }
    // upload
    const newUploadFiles = filesArray.map((file) => {
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
      const uploadFile = {
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
      // check file size
      if (maxFileSize > 0 && uploadFile.fileSize > maxFileSize) {
        uploadFile.uploadStatus = 'error'
        uploadFile.uploadErrorMessage = `Upload failed: ${
          uploadFile.fileName
        } exceeds the ${(maxFileSize / 1024 / 1024).toFixed(
          0,
        )}MB limit. Please select a smaller file.`
      }
      return uploadFile
    })
    await aiProviderUploadFiles(files.concat(newUploadFiles))
    // clear input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  const hasFileUploading = useMemo(() => {
    return files.some((file) => file.uploadStatus === 'uploading')
  }, [files])
  if (
    !AIProviderConfig ||
    clientState.status !== 'success' ||
    conversation.loading
  ) {
    return <></>
  }

  return (
    <Stack
      direction={direction}
      sx={{
        gap: 1,
        ...sx,
      }}
    >
      {files.map((file, fileIndex) => {
        const iconSize = {
          tiny: 16,
          small: 16,
          medium: 24,
          large: 32,
        }[size]
        const isUploading = file.uploadStatus === 'uploading'
        const top = size === 'tiny' ? 2 : -8
        const right = size === 'tiny' ? 2 : -8
        const isHover = hoverId === file.id
        return (
          <TextOnlyTooltip
            arrow
            floatingMenuTooltip={size === 'tiny'}
            placement={'top'}
            open={isUploading}
            title={
              hasFileUploading && fileIndex === 0 && aiProviderUploadingTooltip
            }
            key={file.id}
          >
            <Stack
              className={'max-ai-chat__icon-file-upload'}
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
              <TextOnlyTooltip
                floatingMenuTooltip={size === 'tiny'}
                placement={'top'}
                title={file.uploadErrorMessage || file.fileName}
              >
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
                  <TextOnlyTooltip
                    floatingMenuTooltip={size === 'tiny'}
                    placement={'top'}
                    arrow
                    title={'Remove file'}
                  >
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
          </TextOnlyTooltip>
        )
      })}
      {!isMaxFiles && (
        <TextOnlyTooltip
          floatingMenuTooltip={size === 'tiny'}
          placement={'top'}
          arrow
          title={AIProviderConfig.acceptTooltip || 'Upload file'}
        >
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
        accept={AIProviderConfig.accept || ''}
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
