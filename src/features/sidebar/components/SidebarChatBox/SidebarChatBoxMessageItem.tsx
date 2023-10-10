import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'

import SidebarChatBoxUserTools from './SidebarChatBoxUserTools'
import SidebarChatBoxAiTools from './SidebarChatBoxAiTools'
import SidebarChatBoxSystemTools from './SidebarChatBoxSystemTools'
import { ROOT_CONTAINER_ID } from '@/constants'
import {
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import DevMessageSourceData from '@/features/sidebar/components/SidebarChatBox/DevMessageSourceData'
import DevContent from '@/components/DevContent'
import ChatIconFileList from '@/features/chatgpt/components/ChatIconFileUpload/ChatIconFileList'
import { useCustomTheme } from '@/hooks/useCustomTheme'
const CustomMarkdown = React.lazy(() => import('@/components/CustomMarkdown'))

const SidebarChatBoxMessageItem: FC<{
  replaceAble?: boolean
  insertAble?: boolean
  editAble?: boolean
  useChatGPTAble?: boolean
  message: IChatMessage
  userAvatar?: string | React.ReactNode
  aiAvatar?: string | React.ReactNode
  onSave?: (text: string) => void
  onCopy?: () => void
  onRetry?: (messageId: string) => void
  className?: string
}> = (props) => {
  const {
    message,
    editAble,
    insertAble,
    replaceAble,
    useChatGPTAble,
    onSave,
    onCopy,
    onRetry,
    className,
  } = props
  const { isDarkMode } = useCustomTheme()
  const [defaultText, setDefaultText] = useState(message.text || '')
  const [isEdit, setIsEdit] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const hoverTimer = useRef<any>(null)
  const ChatBoxSx = useMemo(() => {
    const hoverSx = isHover
      ? {
          '& *': {
            userSelect: 'text!important',
          },
        }
      : {
          '& *': {
            userSelect: 'none!important',
          },
        }
    if (message.type === 'ai') {
      return {
        borderRadius: '8px',
        borderBottomLeftRadius: 0,
        // color: 'rgb(56,56,56)!important',
        // bgcolor: `rgb(233,233,235)!important`,

        color: isDarkMode ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
        border: '1px solid',
        borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
        bgcolor: isDarkMode
          ? 'rgba(255, 255, 255, 0.04)'
          : 'rgb(233,233,235)!important',
        ...hoverSx,
      } as SxProps
    }
    if (message.type === 'user' || message.type === 'third') {
      return {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        bgcolor: () => {
          if (String(process.env.APP_ENV) === 'EZ_MAIL_AI') {
            return '#FEE6E1 !important'
          }
          if (isDarkMode) {
            return '#6B23C259 !important'
          } else {
            return '#F1E2FD !important'
          }
        },
        border: '1px solid',
        borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
        color: isDarkMode ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)!important',
        maxWidth: '100%',
        width: 'auto',
        borderRadius: '8px',
        borderBottomRightRadius: 0,
        flexWrap: 'wrap',
        ml: 'auto',
        mr: '0',
        overflow: 'hidden',
        p: 1,
        ...hoverSx,
      } as SxProps
    } else {
      // system message
      const systemMessage: ISystemChatMessage = message as ISystemChatMessage
      if (systemMessage?.extra?.systemMessageType === 'needUpgrade') {
        return {
          borderRadius: '8px',
          bgcolor: '#333',
          '& > div': {
            maxWidth: 450,
            bgcolor: '#333',
            padding: 0,
            '& *': {
              color: '#FFFFFF!important',
            },
          },
          ...hoverSx,
        } as SxProps
      } else {
        const border =
          {
            info: '1px solid #03a9f4!important',
            error: '1px solid rgb(239, 83, 80)!important',
            success: '1px solid #34A853!important',
          }[message?.extra?.status as 'info'] || '1px solid #03a9f4!important'
        return {
          borderRadius: '8px',
          border,
          bgcolor: 'background.paper',
          ...hoverSx,
        } as SxProps
      }
    }
  }, [message.type, isHover, isDarkMode])
  useEffect(() => {
    setDefaultText(message.text || '')
  }, [message.text])
  const attachments = useMemo(() => {
    if (message.type === 'user') {
      const attachments = (message as IUserChatMessage)?.extra?.meta
        ?.attachments
      if (attachments && attachments.length) {
        return attachments.filter((item) => item.uploadStatus === 'success')
      }
    }
    return []
  }, [message])
  return (
    <Stack
      className={className}
      sx={{
        width: '100%',
        p: 1,
        color: 'text.primary',
        position: 'relative',
        '& .chat-message--text': {
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: 1.4,
          fontWeight: 400,
        },
      }}
      onCopy={(event) => {
        // save plain text to clipboard
        event.preventDefault()
        event.stopPropagation()
        // get plain text
        const currentSelection = window.getSelection()
        if (currentSelection && currentSelection.toString().trim()) {
          const plainText = currentSelection.toString().trim()
          if (plainText) {
            navigator.clipboard.writeText(plainText)
          }
        }
      }}
      onMouseEnter={() => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current)
        }
        setIsHover(true)
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current)
        }
        hoverTimer.current = setTimeout(() => {
          setIsHover(false)
          const currentSelection = window.getSelection()
          if (
            currentSelection &&
            currentSelection.toString().trim() &&
            currentSelection.focusNode &&
            currentSelection.focusNode.isSameNode(document.body)
          ) {
            // clear
            currentSelection.removeAllRanges()
          }
        }, 500)
      }}
      spacing={1}
      key={message.messageId}
    >
      <DevContent>
        <DevMessageSourceData message={message} />
      </DevContent>
      {/*<Stack>*/}
      {/*  <p style={{ fontSize: '12px', color: 'red' }}>*/}
      {/*    messageId: {message.messageId}*/}
      {/*  </p>*/}
      {/*  <p style={{ fontSize: '12px', color: 'red' }}>*/}
      {/*    parentMessageId: {message.parentMessageId}*/}
      {/*  </p>*/}
      {/*</Stack>*/}
      <Stack
        className={'chat-message--text'}
        whiteSpace={'pre-wrap'}
        width={'100%'}
        spacing={1}
        p={1}
        sx={{
          wordBreak: 'break-word',
          ...ChatBoxSx,
        }}
      >
        <AppSuspenseLoadingLayout>
          {message.type === 'system' ? (
            <Alert
              severity={message?.extra?.status || 'info'}
              sx={{
                p: 1,
                '& .MuiAlert-message': {
                  p: 0,
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
              <div
                className={`markdown-body ${
                  isDarkMode ? 'markdown-body-dark' : ''
                }`}
              >
                <CustomMarkdown>
                  {defaultText.replace(/^\s+/, '')}
                </CustomMarkdown>
              </div>
            </Alert>
          ) : (
            <Stack
              className={'chat-message--text'}
              id={`${ROOT_CONTAINER_ID}_chat_message_${message.messageId}`}
              contentEditable={isEdit}
              whiteSpace={'pre-wrap'}
              sx={{
                wordBreak: 'break-word',
                borderColor: 'primary.main',
                borderStyle: 'solid',
                borderWidth: isEdit ? 1 : 0,
              }}
            >
              {message.type === 'user' && attachments.length > 0 && (
                <ChatIconFileList
                  size={'small'}
                  direction={'row'}
                  disabledRemove
                  sx={{ mb: 1 }}
                  files={attachments}
                />
              )}
              {message.type !== 'user' ? (
                <div
                  className={`markdown-body ${
                    isDarkMode ? 'markdown-body-dark' : ''
                  }`}
                >
                  <CustomMarkdown>
                    {defaultText.replace(/^\s+/, '')}
                  </CustomMarkdown>
                </div>
              ) : (
                defaultText.replace(/^\s+/, '')
              )}
            </Stack>
          )}
        </AppSuspenseLoadingLayout>
        {message.type === 'user' && (
          <SidebarChatBoxUserTools
            editAble={editAble}
            onCopy={onCopy}
            message={message}
            onSave={() => {
              setIsEdit(false)
              const messageTextElement = document.getElementById(
                `${ROOT_CONTAINER_ID}_chat_message_${message.messageId}`,
              )
              onSave &&
                onSave(messageTextElement?.innerText || message.text || '')
            }}
            onEdit={() => {
              setIsEdit(true)
              setTimeout(() => {
                const editElement = document.getElementById(
                  `${ROOT_CONTAINER_ID}_chat_message_${message.messageId}`,
                )
                if (editElement) {
                  editElement.focus()
                }
              }, 0)
            }}
          />
        )}
        {message.type === 'ai' && (
          <SidebarChatBoxAiTools
            insertAble={insertAble}
            replaceAble={replaceAble}
            useChatGPTAble={useChatGPTAble}
            onCopy={onCopy}
            message={message}
          />
        )}
        {message.type === 'system' && (
          <SidebarChatBoxSystemTools
            onRetry={() => {
              if (message.parentMessageId) {
                onRetry && onRetry(message.parentMessageId)
              }
            }}
            message={message as ISystemChatMessage}
          />
        )}
      </Stack>
    </Stack>
  )
}
export default SidebarChatBoxMessageItem
