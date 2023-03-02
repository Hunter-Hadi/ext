import React, { FC, useEffect, useMemo, useState } from 'react'
import { IGmailChatMessage } from '../index'
import { Alert, Stack, SxProps } from '@mui/material'
import GmailChatBoxUserTools from './GmailChatBoxUserTools'
import GmailChatBoxAiTools from './GmailChatBoxAiTools'
import GmailChatBoxSystemTools from './GmailChatBoxSystemTools'

const GmailChatBoxMessageItem: FC<{
  insertAble?: boolean
  editAble?: boolean
  message: IGmailChatMessage
  userAvatar?: string | React.ReactNode
  aiAvatar?: string | React.ReactNode
  onSave?: (text: string) => void
  onCopy?: () => void
  onRetry?: (messageId: string) => void
}> = (props) => {
  const { message, editAble, insertAble, onSave, onCopy, onRetry } = props
  const [defaultText, setDefaultText] = useState(message.text || '')
  const [isEdit, setIsEdit] = useState(false)
  const ChatBoxSx = useMemo(() => {
    if (message.type === 'ai') {
      return {
        borderRadius: '8px',
        borderBottomLeftRadius: 0,
        color: 'rgb(56,56,56)!important',
        bgcolor: `rgb(233,233,235)!important`,
      } as SxProps
    }
    if (message.type === 'user') {
      return {
        flexDirection: 'row',
        justifyContent: 'end',
        bgcolor: 'rgb(13,121,248)!important',
        color: 'rgb(230,255,255)!important',
        maxWidth: '80%',
        width: 'auto',
        borderRadius: '8px',
        borderBottomRightRadius: 0,
        flexWrap: 'wrap',
        ml: 'auto',
        mr: '0',
        overflow: 'hidden',
        p: 1,
      } as SxProps
    }
    return {
      borderRadius: '8px',
      border: '1px solid rgb(239, 83, 80)!important',
      bgcolor: '#fff!important',
    } as SxProps
  }, [message.type])
  useEffect(() => {
    setDefaultText(message.text || '')
  }, [message.text])
  return (
    <Stack
      sx={{
        width: '100%',
        p: 1,
        color: 'text.primary',
        '& .ezmail-ai--gmail-chat-message': {
          textAlign: 'left',
          fontSize: '14px',
        },
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
        width={'100%'}
        spacing={1}
        p={1}
        sx={{
          ...ChatBoxSx,
        }}
      >
        {message?.status === 'error' ? (
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
            {defaultText}
          </Alert>
        ) : (
          <Stack
            className={'ezmail-ai--gmail-chat-message'}
            id={`ezmail_ai_gmail_chat_message_${message.messageId}`}
            contentEditable={isEdit}
            whiteSpace={'pre-wrap'}
            sx={{
              wordBreak: 'break-word',
              borderColor: 'primary.main',
              borderStyle: 'solid',
              borderWidth: isEdit ? 1 : 0,
            }}
          >
            {defaultText.replace(/^\s+/, '')}
          </Stack>
        )}
        {message.type === 'user' && (
          <GmailChatBoxUserTools
            editAble={editAble}
            onSave={() => {
              setIsEdit(false)
              const messageTextElement = document.getElementById(
                `ezmail_ai_gmail_chat_message_${message.messageId}`,
              )
              onSave &&
                onSave(messageTextElement?.innerText || message.text || '')
            }}
            onEdit={() => {
              setIsEdit(true)
              setTimeout(() => {
                const editElement = document.getElementById(
                  `ezmail_ai_gmail_chat_message_${message.messageId}`,
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
