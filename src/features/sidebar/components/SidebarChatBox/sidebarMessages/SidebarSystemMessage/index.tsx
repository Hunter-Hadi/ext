import Alert, { alertClasses } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo, useState } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import PermissionPricingHookCard from '@/features/auth/components/PermissionPricingHookCard'
import ThirdPartyAIProviderErrorSolution from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog/ThirdPartyAIProviderErrorSolution'
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
// const permissionCardToChatMessageText = (
//   cardSettings: PermissionWrapperCardType,
// ): string => {
//   const { title, description, imageUrl, videoUrl } = cardSettings
//   let markdownText = `**${title}**\n${description}\n\n`
//   if (videoUrl) {
//     markdownText = `![${JSON.stringify({
//       alt: title,
//       cover: imageUrl,
//     })}](${videoUrl})\n${markdownText}`
//   } else if (imageUrl) {
//     markdownText = `![${JSON.stringify({
//       alt: title,
//       cover: imageUrl,
//     })}](${imageUrl})\n${markdownText}`
//   }
//   return markdownText
// }

const BaseSidebarSystemMessage: FC<{
  message: ISystemChatMessage
  loading?: boolean
  sx?: SxProps
}> = (props) => {
  const { message, loading, sx: propSx } = props
  const { isDarkMode } = useCustomTheme()
  const [solutionsShow, setSolutionsShow] = useState(false)
  const permissionSceneType =
    message?.extra?.permissionSceneType ||
    message?.meta?.permissionSceneType ||
    ''
  const isPricingHooksCard =
    message?.extra?.systemMessageType === 'needUpgrade' ||
    message?.meta?.systemMessageType === 'needUpgrade'

  const systemMessageText = useMemo(
    () => formatChatMessageContent(message),
    [message],
  )

  // const systemMessageText = useMemo(() => {
  //   const defaultMessageText = formatChatMessageContent(message)
  //   if (permissionCard) {
  //     return (
  //       permissionCardToChatMessageText(permissionCard) || defaultMessageText
  //     )
  //   }
  //   return defaultMessageText
  // }, [permissionCard, message])

  const memoSx = useMemo(() => {
    if (isPricingHooksCard) {
      return {
        whiteSpace: 'pre-wrap',
        width: '100%',
        p: 1.5,
        gap: 1,
        wordBreak: 'break-word',
        borderRadius: '8px',
        bgcolor: 'customColor.secondaryBackground',
        '& > div': {
          width: '100%',
          maxWidth: 450,
          mx: 'auto!important',
          padding: 0,
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
      data-testid={isPricingHooksCard ? 'pricing-hooks-card' : undefined}
      data-permission-scene-type={
        permissionSceneType ? permissionSceneType : undefined
      }
      sx={
        {
          boxSizing: 'border-box',
          ...memoSx,
          ...propSx,
        } as SxProps
      }
    >
      {isPricingHooksCard && permissionSceneType ? (
        // pricing hook 渲染器
        <PermissionPricingHookCard
          permissionSceneType={permissionSceneType}
          message={message}
        />
      ) : (
        <>
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
              <Stack
                direction={'row'}
                alignItems="flex-start"
                spacing={1.5}
                mb={2}
              >
                <div
                  className={`markdown-body ${
                    isDarkMode ? 'markdown-body-dark' : ''
                  }`}
                >
                  <AppSuspenseLoadingLayout>
                    <CustomMarkdown>{systemMessageText}</CustomMarkdown>
                  </AppSuspenseLoadingLayout>
                </div>
              </Stack>

              {/* Collapse 如果 in 为 false 直接渲染会影响 SvgIcon 组件的渲染 */}
              {/* 虽然不知道为什么，但是目前可以这样解决 */}
              {solutionsShow && (
                <Collapse in={solutionsShow}>
                  <ThirdPartyAIProviderErrorSolution />
                </Collapse>
              )}
            </Box>
          </Alert>
          <SidebarChatBoxSystemTools
            solutionsShow={solutionsShow}
            loading={loading}
            onSolutionToggle={() => {
              setSolutionsShow((pre) => !pre)
            }}
            message={message}
          />
        </>
      )}
    </Stack>
  )
}
export const SidebarSystemMessage = messageWithErrorBoundary(
  BaseSidebarSystemMessage,
)
