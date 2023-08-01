import React, { FC, useMemo, useRef } from 'react'
import { IChatUploadFile } from '@/features/chatgpt/types'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import useAIProviderUpload from '@/features/chatgpt/hooks/useAIProviderUpload'
import { v4 as uuidV4 } from 'uuid'
import {
  checkFileTypeIsImage,
  file2base64,
} from '@/background/utils/uplpadFileProcessHelper'
import ChatIconFileList, {
  ChatIconFileListProps,
} from '@/features/chatgpt/components/ChatIconFileUpload/ChatIconFileList'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { useTranslation } from 'react-i18next'

interface IChatIconFileItemProps extends Omit<ChatIconFileListProps, 'files'> {
  disabled?: boolean
  onUpload?: (files: IChatUploadFile[]) => void
  onDone?: (files: IChatUploadFile[]) => void
}
const ChatIconFileUpload: FC<IChatIconFileItemProps> = (props) => {
  const { disabled = false, TooltipProps, onUpload, onDone, ...rest } = props
  const { t } = useTranslation(['common', 'client'])
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
    const newUploadFiles = await Promise.all(
      filesArray.map(async (file) => {
        const isImageFile = checkFileTypeIsImage(file)
        let icon = 'file'
        let base64Data = ''
        // image, svg, gif
        if (isImageFile) {
          icon = 'image'
          base64Data = (await file2base64(file)) || ''
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
          base64Data,
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
      }),
    )
    await aiProviderUploadFiles(files.concat(newUploadFiles))
    // clear input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  if (
    !AIProviderConfig ||
    clientState.status !== 'success' ||
    conversation.loading
  ) {
    return <></>
  }
  return (
    <ChatIconFileList
      files={files}
      loadingTooltipTitle={aiProviderUploadingTooltip}
      onRemove={async (file) => {
        await aiProviderRemoveFiles([file])
      }}
      TooltipProps={TooltipProps}
      {...rest}
    >
      {!isMaxFiles && (
        <TextOnlyTooltip
          placement={'top'}
          title={
            AIProviderConfig?.acceptTooltip
              ? AIProviderConfig.acceptTooltip(t)
              : 'Upload file'
          }
          {...TooltipProps}
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
        accept={AIProviderConfig?.accept || ''}
        hidden
        style={{
          display: 'none',
        }}
        type={'file'}
      />
    </ChatIconFileList>
  )
}

export default ChatIconFileUpload
