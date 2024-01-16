import Alert, { alertClasses } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo, useState } from 'react'

import { usePermissionCard } from '@/features/auth'
import { PermissionWrapperCardType } from '@/features/auth/components/PermissionWrapper/types'
import ThirdPartAIProviderErrorSolution from '@/features/chatgpt/components/AIProviderSelectorCard/ThirdPartAIProviderConfirmDialog/ThirdPartAIProviderErrorSolution'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import SidebarChatBoxSystemTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarSystemMessage/SidebarChatBoxSystemTools'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'

const CustomMarkdown = React.lazy(() => import('@/components/CustomMarkdown'))

/**
 * 转换permissionWrapper的Card信息为markdown
 * @param cardSettings
 */
const permissionCardToChatMessageText = (
  cardSettings: PermissionWrapperCardType,
): string => {
  const { title, description, imageUrl, videoUrl } = cardSettings
  let markdownText = `**${title}**\n${description}\n\n`
  if (videoUrl) {
    markdownText = `![${JSON.stringify({
      alt: title,
      cover: imageUrl,
    })}](${videoUrl})\n${markdownText}`
  } else if (imageUrl) {
    markdownText = `![${JSON.stringify({
      alt: title,
      cover: imageUrl,
    })}](${imageUrl})\n${markdownText}`
  }
  return markdownText
}

const BaseSidebarSystemMessage: FC<{
  message: ISystemChatMessage
}> = (props) => {
  const { message } = props
  const { isDarkMode } = useCustomTheme()
  const [solutionsShow, setSolutionsShow] = useState(false)
  const permissionSceneType =
    message?.extra?.permissionSceneType ||
    message?.meta?.permissionSceneType ||
    ''
  const permissionCard = usePermissionCard(permissionSceneType)
  const isPricingHooksCard =
    message?.extra?.systemMessageType === 'needUpgrade' ||
    message?.meta?.systemMessageType === 'needUpgrade'
  const systemMessageText = useMemo(() => {
    const defaultMessageText = formatChatMessageContent(message)
    if (permissionCard) {
      return (
        permissionCardToChatMessageText(permissionCard) || defaultMessageText
      )
    }
    return defaultMessageText
  }, [permissionCard, message])
  const memoSx = useMemo(() => {
    if (isPricingHooksCard) {
      return {
        whiteSpace: 'pre-wrap',
        width: '100%',
        p: 1,
        gap: 1,
        wordBreak: 'break-word',
        borderRadius: '8px',
        bgcolor: '#333',
        '& > div': {
          width: '100%',
          maxWidth: 450,
          mx: 'auto!important',
          bgcolor: '#333',
          padding: 0,
          '& *': {
            color: '#FFFFFF!important',
          },
        },
      } as SxProps
    } else {
      const border =
        {
          info: '1px solid #03a9f4!important',
          error: '1px solid rgb(239, 83, 80)!important',
          success: '1px solid #34A853!important',
        }[message?.meta?.status as 'info'] || '1px solid #03a9f4!important'
      return {
        whiteSpace: 'pre-wrap',
        width: '100%',
        p: 1,
        gap: 1,
        wordBreak: 'break-word',
        borderRadius: '8px',
        border,
        bgcolor: 'background.paper',
      } as SxProps
    }
  }, [isPricingHooksCard])
  return (
    <Stack
      className={'chat-message--text'}
      sx={{
        ...memoSx,
      }}
    >
      <Alert
        severity={message?.meta?.status || 'info'}
        sx={{
          p: 1,
          [`& .${alertClasses.message}`]: {
            p: 0,
            width: '100%',
          },
          '& > div:first-child': {
            display: 'none',
          },
          '& .markdown-body': {
            '& > p:first-child': {
              mt: 0,
            },
          },
        }}
        icon={<></>}
      >
        <Box>
          <Stack direction={'row'} alignItems="flex-start" spacing={1.5} mb={2}>
            <div
              className={`markdown-body ${
                isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <CustomMarkdown>{systemMessageText}</CustomMarkdown>
            </div>
          </Stack>
          <Collapse in={solutionsShow}>
            <ThirdPartAIProviderErrorSolution />
          </Collapse>
        </Box>
      </Alert>
      <SidebarChatBoxSystemTools
        solutionsShow={solutionsShow}
        onSolutionToggle={() => {
          setSolutionsShow((pre) => !pre)
        }}
        message={message}
      />
    </Stack>
  )
}
export const SidebarSystemMessage = messageWithErrorBoundary(
  BaseSidebarSystemMessage,
)