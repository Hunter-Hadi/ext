import Button from '@mui/material/Button'
import React, { FC, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { checkFileTypeIsImage } from '@/background/utils/uplpadFileProcessHelper'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ChatIconFileList, {
  ChatIconFileListProps,
} from '@/features/chatgpt/components/ChatIconFileUpload/ChatIconFileList'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'

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
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const inputRef = useRef<HTMLInputElement>(null)
  const maxFiles = AIProviderConfig?.maxCount || 1
  const maxFileSize = AIProviderConfig?.maxFileSize
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
    let filesArray: File[] = Array.from(selectedUploadFiles)
    filesArray = filesArray.slice(0, canUploadCount)
    if (filesArray.length === 0) {
      return
    }
    const waitExtractTextFiles: File[] = []
    const extractedTextFiles: IChatUploadFile[] = []
    filesArray = filesArray.filter((file) => {
      if (FileExtractor.canExtractTextFromFileName(file.name)) {
        waitExtractTextFiles.push(file)
        return false
      }
      return checkFileTypeIsImage(file)
    })
    await Promise.all(
      waitExtractTextFiles.map(async (waitExtractTextFile) => {
        const extractedResult = await FileExtractor.extractFile(
          waitExtractTextFile,
        )
        if (extractedResult.success) {
          extractedTextFiles.push(extractedResult.chatUploadFile)
        }
      }),
    )

    // upload
    const newUploadFiles = await formatClientUploadFiles(
      filesArray,
      maxFileSize,
    )

    await aiProviderUploadFiles(extractedTextFiles.concat(newUploadFiles))
    // clear input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  if (
    !AIProviderConfig ||
    clientState.status !== 'success' ||
    smoothConversationLoading
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
