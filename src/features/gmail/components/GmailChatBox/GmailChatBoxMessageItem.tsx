import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Stack, SxProps, Theme } from '@mui/material'
import GmailChatBoxUserTools from './GmailChatBoxUserTools'
import GmailChatBoxAiTools from './GmailChatBoxAiTools'
import GmailChatBoxSystemTools from './GmailChatBoxSystemTools'
import { ROOT_CONTAINER_ID } from '@/types'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import CustomMarkdown from '@/components/CustomMarkdown'
import { IChatMessage } from '@/features/chatgpt/types'

const GmailChatBoxMessageItem: FC<{
  replaceAble?: boolean
  insertAble?: boolean
  editAble?: boolean
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
    onSave,
    onCopy,
    onRetry,
    className,
  } = props
  const [defaultText, setDefaultText] = useState(message.text || '')
  const { userSettings } = useRecoilValue(AppSettingsState)
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

        color:
          userSettings?.colorSchema === 'dark'
            ? '#FFFFFFDE'
            : 'rgba(0,0,0,0.87)!important',
        border: '1px solid',
        borderColor:
          userSettings?.colorSchema === 'dark'
            ? 'customColor.borderColor'
            : 'transparent',
        bgcolor: (t: Theme) =>
          t.palette.mode === 'dark'
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
          if (userSettings?.colorSchema === 'dark') {
            return '#6B23C259 !important'
          } else {
            return '#F1E2FD !important'
          }
        },
        border: '1px solid',
        borderColor:
          userSettings?.colorSchema === 'dark'
            ? 'customColor.borderColor'
            : 'transparent',
        color:
          userSettings?.colorSchema === 'dark'
            ? '#FFFFFFDE'
            : 'rgba(0,0,0,0.87)!important',
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
    }
    return {
      borderRadius: '8px',
      border: '1px solid rgb(239, 83, 80)!important',
      bgcolor: 'background.paper',
    } as SxProps
  }, [message.type, userSettings, isHover])
  useEffect(() => {
    setDefaultText(message.text || '')
  }, [message.text])

  return (
    <Stack
      className={className}
      sx={{
        width: '100%',
        p: 1,
        color: 'text.primary',
        '& .chat-message--text': {
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '26px',
        },
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
        {message?.extra?.status === 'error' ? (
          <Alert
            severity={'error'}
            sx={{
              p: 1,
              '& .MuiAlert-message': {
                p: 0,
              },
            }}
            icon={<></>}
          >
            <div
              className={`markdown-body ${
                userSettings?.colorSchema === 'dark'
                  ? 'markdown-body--dark'
                  : ''
              }`}
            >
              <CustomMarkdown>{defaultText.replace(/^\s+/, '')}</CustomMarkdown>
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
            {message.type !== 'user' ? (
              <div
                className={`markdown-body ${
                  userSettings?.colorSchema === 'dark'
                    ? 'markdown-body--dark'
                    : ''
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
        {message.type === 'user' && (
          <GmailChatBoxUserTools
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
          <GmailChatBoxAiTools
            insertAble={insertAble}
            replaceAble={replaceAble}
            onCopy={onCopy}
            message={message}
          />
        )}
        {message.type === 'system' && (
          <GmailChatBoxSystemTools
            onRetry={() => {
              if (message.parentMessageId) {
                onRetry && onRetry(message.parentMessageId)
              }
            }}
            message={message}
          />
        )}
      </Stack>
    </Stack>
  )
}
export default GmailChatBoxMessageItem
