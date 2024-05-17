import Button from '@mui/material/Button'
import React, { FC, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ChatIconFileList, {
  ChatIconFileListProps,
} from '@/features/chatgpt/components/ChatIconFileUpload/ChatIconFileList'
import { MAXAI_IN_HOUSE_AI_PROVIDERS } from '@/features/chatgpt/constant'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useMaxAIModelUploadFile from '@/features/chatgpt/hooks/upload/useMaxAIModelUploadFile'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'

import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message';

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
    aiProviderRemoveFiles,
    aiProviderUploadingTooltip,
    getCanUploadFiles,
    aiProviderUploadFiles,
  } = useAIProviderUpload()
  const { uploadFilesToMaxAIModel, isContainMaxAIModelUploadFile } =
    useMaxAIModelUploadFile()
  const { conversationStatus, clientConversation } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const inputRef = useRef<HTMLInputElement>(null)
  const maxFiles = AIProviderConfig?.maxCount || 1

  const isMaxFiles = useMemo(() => {
    return files.length >= (AIProviderConfig?.maxCount || 1)
  }, [files])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedUploadFiles = e.target.files
    const currentAIProvider = clientConversation?.meta.AIProvider
    if (!selectedUploadFiles || !currentAIProvider) {
      return
    }
    const canUploadFiles: File[] = await getCanUploadFiles(
      Array.from(selectedUploadFiles),
    )
    if (canUploadFiles.length === 0) {
      return
    }
    // upload
    if (
      MAXAI_IN_HOUSE_AI_PROVIDERS.includes(currentAIProvider) &&
      isContainMaxAIModelUploadFile(canUploadFiles)
    ) {
      await uploadFilesToMaxAIModel(canUploadFiles)
    } else {
      const newUploadFiles = await formatClientUploadFiles(canUploadFiles)
      await aiProviderUploadFiles(newUploadFiles)
    }
    // clear input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  if (
    !AIProviderConfig ||
    conversationStatus !== 'success' ||
    smoothConversationLoading
  ) {
    console.log(
      `ChatIconFileUpload:`,
      AIProviderConfig,
      conversationStatus,
      smoothConversationLoading,
    )
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
            data-testid={'chat-file-upload-button'}
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
              icon={'Attachment'}
              sx={{
                transform: 'rotate(-45deg)',
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
