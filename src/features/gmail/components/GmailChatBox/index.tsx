import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  SxProps,
  Typography,
} from '@mui/material'
import CachedIcon from '@mui/icons-material/Cached'
import GmailChatBoxInput from './GmailChatBoxInput'
import GmailChatBoxMessageItem from './GmailChatBoxMessageItem'
import SendIcon from '@mui/icons-material/Send'
import BlockIcon from '@mui/icons-material/Block'
import { numberWithCommas } from '@/utils'
import { useRecoilValue } from 'recoil'
import { InboxEditState } from '@/features/gmail/store'
import { CHROME_EXTENSION_MAIL_TO } from '@/types'
export interface IGmailChatMessage {
  type: 'user' | 'ai' | 'system' | 'third'
  messageId: string
  parentMessageId?: string
  text: string
  status?: 'error' | 'success'
}

const MAX_INPUT_LENGTH = 10000

interface IGmailChatBoxProps {
  sx?: SxProps
  title?: string
  userAvatar?: string | React.ReactNode
  aiAvatar?: string | React.ReactNode
  editAble?: boolean
  insertAble?: boolean
  reGenerateAble?: boolean
  onCopy?: () => void
  onReGenerate?: () => void
  onStopGenerate?: () => void
  onQuestionUpdate?: (messageId: string, newQuestionText: string) => void
  messages: IGmailChatMessage[]
  writingMessage: IGmailChatMessage | null
  onSendMessage?: (text: string) => void
  defaultValue?: string
  onRetry?: (messageId: string) => void
  loading?: boolean
}

const GmailChatBox: FC<IGmailChatBoxProps> = (props) => {
  const {
    sx,
    aiAvatar,
    userAvatar,
    onCopy,
    onQuestionUpdate,
    editAble = true,
    insertAble = true,
    reGenerateAble = true,
    onReGenerate,
    onStopGenerate,
    onSendMessage,
    // title = 'Chat',
    defaultValue = '',
    writingMessage,
    messages,
    onRetry,
    loading,
  } = props
  const { step } = useRecoilValue(InboxEditState)
  const stackRef = useRef<HTMLElement | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue || '')
  const isGmailChatBoxError = useMemo(() => {
    return inputValue.length > MAX_INPUT_LENGTH
  }, [inputValue])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stackRef.current) {
        stackRef.current.scrollTo(0, stackRef.current.scrollHeight)
      }
    }, 100)
    return () => {
      clearTimeout(timer)
    }
  }, [writingMessage, messages])
  useEffect(() => {
    console.log('default update', step)
    setInputValue(defaultValue)
  }, [defaultValue, step])
  return (
    <Stack
      position={'relative'}
      borderTop={'1px solid #e0e0e0'}
      sx={{
        height: 0,
        flex: 1,
        '& .MuiButton-root': {
          textTransform: 'none',
        },
        ...sx,
      }}
    >
      {/*//TODO hide title*/}
      {/*<Stack*/}
      {/*  flexShrink={0}*/}
      {/*  height={56}*/}
      {/*  alignItems={'center'}*/}
      {/*  justifyContent={'center'}*/}
      {/*  sx={{*/}
      {/*    bgcolor: 'rgb(52,54,65)',*/}
      {/*    position: 'sticky',*/}
      {/*    top: 0,*/}
      {/*    zIndex: 1,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography color={'#fff'} variant={'body1'} fontSize={24}>*/}
      {/*    {title}*/}
      {/*  </Typography>*/}
      {/*</Stack>*/}
      <Box
        ref={stackRef}
        flex={1}
        height={0}
        sx={{
          overflowY: 'auto',
        }}
      >
        {messages.map((message) => {
          return (
            <GmailChatBoxMessageItem
              insertAble={insertAble}
              replaceAble={true}
              message={message}
              aiAvatar={aiAvatar}
              editAble={editAble}
              userAvatar={userAvatar}
              key={message.messageId}
              onSave={(value) => {
                onQuestionUpdate && onQuestionUpdate(message.messageId, value)
              }}
              onRetry={onRetry}
              onCopy={onCopy}
            />
          )
        })}
        {writingMessage && (
          <GmailChatBoxMessageItem
            replaceAble={false}
            insertAble={false}
            message={writingMessage}
            aiAvatar={aiAvatar}
            editAble={false}
            userAvatar={userAvatar}
          />
        )}
      </Box>
      {/*// input height*/}
      <Box height={8} flexShrink={0} />
      <Stack
        position={'relative'}
        mt={'auto'}
        justifyContent={'center'}
        alignItems={'center'}
        minHeight={60}
        spacing={1}
        p={1}
        flexShrink={0}
        bgcolor={'#fff'}
      >
        <Stack width={'100%'} alignItems={'center'} justifyContent={'center'}>
          <Box
            sx={{ width: '100%' }}
            component={'div'}
            display={'flex'}
            width={0}
            flex={1}
            alignItems={'center'}
            justifyContent={'center'}
            gap={1}
          >
            {!loading && reGenerateAble && messages.length > 0 && (
              <Button
                sx={{ mb: 1 }}
                disableElevation
                startIcon={<CachedIcon />}
                variant={'outlined'}
                disabled={loading}
                onClick={() => {
                  onReGenerate && onReGenerate()
                  setInputValue('')
                }}
              >
                Regenerate
              </Button>
            )}
            {loading && (
              <Button
                sx={{ mb: 1 }}
                disableElevation
                variant={'outlined'}
                startIcon={<BlockIcon />}
                onClick={() => {
                  onStopGenerate && onStopGenerate()
                }}
              >
                Stop generating
              </Button>
            )}
          </Box>
          <GmailChatBoxInput
            error={isGmailChatBoxError && !loading}
            loading={loading}
            defaultValue={inputValue}
            onChange={setInputValue}
            onEnter={(value) => {
              onSendMessage && onSendMessage(value)
              setInputValue('')
            }}
          >
            <Stack
              p={1}
              direction={'row'}
              alignItems={'center'}
              spacing={1}
              width={'100%'}
            >
              <Typography
                component={'span'}
                color={
                  isGmailChatBoxError ? 'rgb(239, 83, 80)' : 'text.secondary'
                }
                fontSize={12}
                // 用等宽字体，不然会左右闪烁宽度
                fontFamily={
                  'Roboto,RobotoDraft,Helvetica,Arial,sans-serif!important'
                }
              >
                {loading ? 0 : numberWithCommas(inputValue.length, 0)}/
                {numberWithCommas(MAX_INPUT_LENGTH, 0)}
              </Typography>
              <Box
                component={'div'}
                display={'flex'}
                width={0}
                flex={1}
                alignItems={'center'}
                justifyContent={'end'}
                gap={1}
              >
                <Button
                  disableElevation
                  variant={'contained'}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={16} /> : <SendIcon />
                  }
                  onClick={() => {
                    onSendMessage && onSendMessage(inputValue)
                    setInputValue('')
                  }}
                >
                  Generate
                </Button>
              </Box>
            </Stack>
          </GmailChatBoxInput>
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{ width: '100%' }}
          justifyContent={'space-between'}
        >
          <Typography fontSize={12}>
            <Link
              color={'text.primary'}
              sx={{ cursor: 'pointer' }}
              underline={'always'}
              target={'_blank'}
              href={CHROME_EXTENSION_MAIL_TO}
            >
              Contact us
            </Link>
          </Typography>
          <Typography fontSize={12} color={'text.secondary'} ml={'auto'} mr={0}>
            Tip: Press Shift+Return for new line
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export { GmailChatBox }
