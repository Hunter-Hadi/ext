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
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import GmailChatBoxMessageItem from './GmailChatBoxMessageItem'
import SendIcon from '@mui/icons-material/Send'
import BlockIcon from '@mui/icons-material/Block'
import { numberWithCommas } from '@/utils'
import { useRecoilValue } from 'recoil'
import {
  ChatGPTConversationState,
  InboxEditState,
} from '@/features/gmail/store'
import { CHROME_EXTENSION_MAIL_TO } from '@/types'
import { ChatGPTModelsSelector } from '@/features/chatgpt/components/ChatGPTModelsSelector'
import { FloatingContextMenuButton } from '@/features/contextMenu'
import { CleanChatBoxIcon } from '@/components/CustomIcon'
import TooltipButton from '@/components/TooltipButton'
import DevContent from '@/components/DevContent'
import { TestAllActionsButton } from '@/features/shortcuts'
import throttle from 'lodash-es/throttle'
export interface IGmailChatMessage {
  type: 'user' | 'ai' | 'system' | 'third'
  messageId: string
  parentMessageId?: string
  text: string
  status?: 'error' | 'success'
}

const MAX_NORMAL_INPUT_LENGTH = 10000
const MAX_GPT4_INPUT_LENGTH = 80000
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

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
  onReset?: () => void
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
    onReset,
    loading,
  } = props
  const conversation = useRecoilValue(ChatGPTConversationState)
  const { step } = useRecoilValue(InboxEditState)
  const stackRef = useRef<HTMLElement | null>(null)
  const textareaRef = useRef<null | HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState(defaultValue || '')
  // 为了在消息更新前计算滚动高度
  const currentMaxInputLength = useMemo(() => {
    return conversation.model === 'gpt-4'
      ? MAX_GPT4_INPUT_LENGTH
      : MAX_NORMAL_INPUT_LENGTH
  }, [conversation.model])
  const isGmailChatBoxError = useMemo(() => {
    return inputValue.length > currentMaxInputLength
  }, [inputValue, currentMaxInputLength])
  const scrolledToBottomRef = useRef(true)
  useEffect(() => {
    const list = stackRef.current
    if (!list) {
      return
    }
    const handleScroll = (event: any) => {
      if (event.deltaY < 0) {
        scrolledToBottomRef.current = false
        return
      }
      const scrollTop = list.scrollTop
      const scrollHeight = list.scrollHeight
      const clientHeight = list.clientHeight
      const isScrolledToButton = clientHeight + scrollTop >= scrollHeight
      if (isScrolledToButton) {
        scrolledToBottomRef.current = true
      }
    }

    const throttleHandleScroll = throttle(handleScroll, 100)
    list.addEventListener('wheel', throttleHandleScroll)
    return () => list.removeEventListener('wheel', throttleHandleScroll)
  }, [])
  useEffect(() => {
    const list = stackRef.current
    if (scrolledToBottomRef.current && list) {
      list.scrollTo(0, list.scrollHeight)
    }
  }, [writingMessage])
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'user') {
        scrolledToBottomRef.current = true
      }
    }
  }, [messages])
  useEffect(() => {
    console.log('default update', step)
    setInputValue(defaultValue)
  }, [defaultValue, step])
  return (
    <Stack
      position={'relative'}
      borderTop={'1px solid'}
      borderColor="customColor.borderColor"
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
          textAlign: 'left',
          overflowY: 'auto',
        }}
      >
        <ChatGPTModelsSelector />
        {messages.map((message) => {
          return (
            <GmailChatBoxMessageItem
              className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
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
            className={'use-chat-gpt-ai__writing-message-item'}
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
        // bgcolor={'#fff'}
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
            mb={1}
            position={'relative'}
          >
            {!loading && messages.length > 0 && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 36,
                    height: 36,
                  }}
                >
                  <TooltipButton
                    title={'New chat'}
                    sx={{
                      fontSize: '26px',
                      p: '5px',
                      minWidth: 'unset',
                      borderRadius: '18px',
                    }}
                    disableElevation
                    variant={'contained'}
                    disabled={loading}
                    onClick={() => {
                      onReset && onReset()
                      setInputValue('')
                    }}
                  >
                    <CleanChatBoxIcon
                      sx={{ color: 'inherit', fontSize: 'inherit' }}
                    />
                  </TooltipButton>
                </Box>
                {!isEzMailApp && <FloatingContextMenuButton />}
                {reGenerateAble && (
                  <Button
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
              </>
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
          <AutoHeightTextarea
            stopPropagation
            textareaRef={textareaRef}
            error={isGmailChatBoxError && !loading}
            loading={loading}
            defaultValue={inputValue}
            onChange={setInputValue}
            onEnter={(value) => {
              onSendMessage && onSendMessage(value)
              setInputValue('')
            }}
            childrenHeight={45}
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
                {numberWithCommas(currentMaxInputLength, 0)}
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
                <DevContent>
                  <TestAllActionsButton />
                </DevContent>
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
                  {loading ? 'Generating' : 'Generate'}
                </Button>
              </Box>
            </Stack>
          </AutoHeightTextarea>
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
