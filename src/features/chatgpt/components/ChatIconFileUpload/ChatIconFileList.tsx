import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo, useState } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import { IChatUploadFile } from '@/features/chatgpt/types'

export interface ChatIconFileListProps {
  files: IChatUploadFile[]
  children?: React.ReactNode
  direction?: 'row' | 'column'
  size?: 'tiny' | 'small' | 'medium' | 'large'
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
  loadingTooltipTitle?: string
  sx?: SxProps
  disabledRemove?: boolean
  onRemove?: (file: IChatUploadFile) => void
  minWidth?: number
}

const ChatIconFileList: FC<ChatIconFileListProps> = (props) => {
  const {
    files,
    direction = 'row',
    size = 'medium',
    sx,
    TooltipProps,
    loadingTooltipTitle,
    disabledRemove = false,
    onRemove,
    children,
    minWidth,
  } = props
  const [hoverId, setHoverId] = useState<string>('')
  const boxHeight = {
    tiny: 24,
    small: 24,
    medium: 32,
    large: 40,
  }[size]
  const hasFileUploading = useMemo(() => {
    return files.some((file) => file.uploadStatus === 'uploading')
  }, [files])
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
        const top = size === 'tiny' ? 2 : -8
        const right = size === 'tiny' ? 2 : -8
        const isHover = hoverId === file.id
        return (
          <TextOnlyTooltip
            placement={'top'}
            open={hasFileUploading && fileIndex === 0}
            title={loadingTooltipTitle}
            key={file.id}
            {...TooltipProps}
          >
            <Stack
              className={'max-ai-chat__icon-file-upload'}
              direction={'row'}
              position={'relative'}
              sx={{
                width: Math.max(2.5 * boxHeight, minWidth || 0),
                maxWidth: Math.max(2.5 * boxHeight, minWidth || 0),
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
                    src={file.base64Data || file.blobUrl}
                  />
                )}
              </Stack>
              <TextOnlyTooltip
                placement={'top'}
                title={file.uploadErrorMessage || file.fileName}
                {...TooltipProps}
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
              {!disabledRemove && isHover && (
                <Box top={top} right={right} position={'absolute'}>
                  <TextOnlyTooltip placement={'top'} title={'Remove file'}>
                    <Button
                      sx={{
                        minWidth: 'unset',
                        p: 0,
                        color: 'rgba(142,142,159, 1)',
                        '&:hover': {
                          color: 'primary.main',
                        },
                      }}
                      onClick={() => {
                        onRemove?.(file)
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
      {children}
    </Stack>
  )
}
export default ChatIconFileList
