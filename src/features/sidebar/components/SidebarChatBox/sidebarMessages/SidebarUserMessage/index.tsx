import { ArrowForwardIosOutlined } from '@mui/icons-material'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'

import { getMessageAttachmentExtractedContent } from '@/background/src/chat/util'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import LazyLoadImage from '@/components/LazyLoadImage'
import MessageContextTooltip from '@/components/MessageContextTooltip'
import { IUserChatMessage } from '@/features/indexed_db/conversations/models/Message'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import SidebarContextCleared from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarContextCleared'
import SidebarChatBoxUserTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarChatBoxUserTools'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const BaseSidebarUserMessage: FC<{
  message: IUserChatMessage
  order?: number
  container?: HTMLElement
}> = (props) => {
  const { message, order, container } = props
  const memoSx = useMemo(() => {
    return {
      whiteSpace: 'pre-wrap',
      p: 1,
      gap: 1,
      wordBreak: 'break-word',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      bgcolor: 'rgba(144, 101, 176, 0.16)',
      // border: '1px solid',
      // borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
      color: 'text.primary',
      maxWidth: '100%',
      width: 'auto',
      borderRadius: '8px',
      borderBottomRightRadius: 0,
      flexWrap: 'wrap',
      ml: 'auto',
      mr: '0',
      overflow: 'hidden',
    } as SxProps
  }, [message])

  const showDivider = useMemo(() => {
    return !message.meta?.includeHistory && order !== 1
  }, [message, order])

  return (
    <Box component={'div'} className={'chat-message--user'}>
      {showDivider && <SidebarContextCleared message={message} />}
      {/* <SidebarUserMessageContexts message={message} container={container} /> */}
      <MessageContextTooltip message={message} container={container}>
        {({ toggle, attachments, shortContext }) => {
          const extractedContentAttachments = attachments.filter(
            (attachment) =>
              !!getMessageAttachmentExtractedContent(attachment, message),
          )

          return (
            <Stack
              onClick={toggle}
              gap={1}
              sx={{
                borderRadius: '8px',
                maxWidth: '100%',
                // width: 'max-content',
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#393743' : '#F6F2F9',
                borderLeft: '4px solid #9065B0',
                cursor: 'pointer',
              }}
              p={1}
            >
              <Stack
                width={'100%'}
                ml={'auto'}
                flexDirection={'row'}
                gap={1}
                alignItems={'flex-end'}
                justifyContent={'flex-end'}
              >
                {/*// 主要展示的内容，如果有附件则展示附件，如果有上下文则展示上下文*/}
                {attachments.length > 0 && (
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    justifyContent={'flex-start'}
                    width={'100%'}
                    gap={0.5}
                  >
                    {attachments.map((attachment) => {
                      if (attachment.fileType.startsWith('image')) {
                        if (!attachment.uploadedUrl) {
                          return null
                        }
                        return (
                          <LazyLoadImage
                            imgStyle={{
                              borderRadius: '8px',
                              border: '1px solid #00000014',
                              objectFit: 'contain',
                              boxSizing: 'border-box',
                            }}
                            key={attachment.uploadedUrl}
                            src={attachment.uploadedUrl}
                            fileId={attachment.uploadedFileId}
                            alt={attachment.fileName}
                            width={64}
                            height={48}
                          />
                        )
                      }
                      return null
                    })}
                  </Stack>
                )}
                {attachments.length === 0 && (
                  <Typography
                    data-testid={'user-message-short-contexts'}
                    sx={{
                      textAlign: 'left',
                      color: (t: any) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.38)'
                          : 'rgba(0, 0, 0, 0.38)',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                      lineClamp: `2`,
                      boxOrient: 'vertical',
                      display: '-webkit-box',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    fontSize={'14px'}
                    variant={'body2'}
                    lineHeight={'20px'}
                  >
                    {shortContext}
                  </Typography>
                )}
                {extractedContentAttachments.length === 0 && (
                  <Stack flexShrink={0}>
                    <ArrowForwardIosOutlined
                      sx={{
                        height: '20px',
                        fontSize: '16px',
                        color: (t: any) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.38)'
                            : 'rgba(0, 0, 0, 0.38)',
                      }}
                    />
                  </Stack>
                )}
              </Stack>
              {attachments.length > 0 && (
                <Stack gap={1} width={'100%'}>
                  {extractedContentAttachments.map((attachment, index) => {
                    return (
                      <Stack
                        key={attachment.id}
                        border={'1px solid'}
                        borderColor='customColor.borderColor'
                        direction={'row'}
                        gap={1}
                        width={240}
                        borderRadius={1}
                        p={1}
                        ml={'auto'}
                      >
                        <Stack
                          flexShrink={0}
                          borderRadius={`8px`}
                          width={40}
                          height={40}
                          alignItems={'center'}
                          justifyContent={'center'}
                          bgcolor={'primary.main'}
                        >
                          <ContextMenuIcon
                            icon={'InsertDriveFile'}
                            sx={{
                              color: '#fff',
                              fontSize: `${28}px`,
                            }}
                          />
                        </Stack>
                        <Stack width={0} flex={1}>
                          <Typography
                            lineHeight={`20px`}
                            color={'text.primary'}
                            fontSize={'14px'}
                            noWrap
                          >
                            {attachment.fileName}
                          </Typography>
                          <Typography
                            lineHeight={`20px`}
                            color={'text.secondary'}
                            fontSize={'14px'}
                            noWrap
                          >
                            {attachment.fileType}
                          </Typography>
                        </Stack>
                        {extractedContentAttachments.length - 1 === index && (
                          <Stack flexShrink={0} mt={'auto'}>
                            <ArrowForwardIosOutlined
                              sx={{
                                height: '20px',
                                fontSize: '16px',
                                color: (t: any) =>
                                  t.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.38)'
                                    : 'rgba(0, 0, 0, 0.38)',
                              }}
                            />
                          </Stack>
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          )
        }}
      </MessageContextTooltip>

      <Stack className={'chat-message--text'} sx={memoSx}>
        {formatChatMessageContent(message, false)}
        <SidebarChatBoxUserTools message={message} />
      </Stack>
    </Box>
  )
}

export const SidebarUserMessage = messageWithErrorBoundary(
  BaseSidebarUserMessage,
)
