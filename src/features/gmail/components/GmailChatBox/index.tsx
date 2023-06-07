import React, { FC, useCallback, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'
import CachedIcon from '@mui/icons-material/Cached'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
// import SendIcon from '@mui/icons-material/Send'
import BlockIcon from '@mui/icons-material/Block'
// import { numberWithCommas } from '@/utils'
// import { useRecoilValue } from 'recoil'
// import { ChatGPTConversationState } from '@/features/gmail/store'
import { CHROME_EXTENSION_MAIL_TO } from '@/types'
import { CleanChatBoxIcon } from '@/components/CustomIcon'
import TooltipButton from '@/components/TooltipButton'
// import DevContent from '@/components/DevContent'
// import { TestAllActionsButton } from '@/features/shortcuts'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markdownCss from '@/pages/markdown.less'
import throttle from 'lodash-es/throttle'
import { ChatGPTAIProviderSelector } from '@/features/chatgpt/components/ChatGPTAIProviderSelector'
import {
  IChatMessage,
  IUserSendMessageExtraType,
} from '@/features/chatgpt/types'
import GmailChatBoxInputActions from '@/features/gmail/components/GmailChatBox/GmailChatBoxInputActions'
import GmailChatBoxProviderComponents from '@/features/gmail/components/GmailChatBox/GmailChatBoxProviderComponents'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import useSliceMessageList from '../../hooks/useSliceMessageList'
import GmailChatBoxReleaseLog from '@/features/gmail/components/GmailChatBox/GmailChatBoxReleaseLog'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
// import { getMediator } from '@/store/mediator'

// const MAX_NORMAL_INPUT_LENGTH = 10000
// const MAX_GPT4_INPUT_LENGTH = 80000

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
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
  onSendMessage?: (text: string, options: IUserSendMessageExtraType) => void
  onRetry?: (messageId: string) => void
  loading?: boolean
}

const GmailChatBoxMessageItem = React.lazy(
  () =>
    import('@/features/gmail/components/GmailChatBox/GmailChatBoxMessageItem'),
)

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
    writingMessage,
    messages,
    onRetry,
    onReset,
    loading,
  } = props
  // const conversation = useRecoilValue(ChatGPTConversationState)
  const stackRef = useRef<HTMLElement | null>(null)
  const messageListContainerList = useRef<HTMLElement | null>(null)
  const [isShowContinueButton, setIsShowContinueButton] = React.useState(false)
  const { slicedMessageList, changePageNumber } = useSliceMessageList(
    messageListContainerList,
    messages,
  )
  // const [inputValue, setInputValue] = useState('')
  // 为了在消息更新前计算滚动高度
  // const currentMaxInputLength = useMemo(() => {
  //   // NOTE: GPT-4 最大输入长度为 80000，GPT-3 最大输入长度为 10000, 我们后端最多6000，所以这里写死4000
  //   return 4000
  //   return conversation.model === 'gpt-4'
  //     ? MAX_GPT4_INPUT_LENGTH
  //     : MAX_NORMAL_INPUT_LENGTH
  // }, [conversation.model])
  // const isGmailChatBoxError = useMemo(() => {
  //   return inputValue.length > currentMaxInputLength
  // }, [inputValue, currentMaxInputLength])
  const scrolledToBottomRef = useRef(true)

  const handleSendMessage = useCallback(
    (value: string, options: IUserSendMessageExtraType) => {
      changePageNumber(1)
      onSendMessage && onSendMessage(value, options)
    },
    [onSendMessage, changePageNumber],
  )

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
  const lastScrollId = useRef('')
  useEffect(() => {
    if (messages.length > 0) {
      setIsShowContinueButton(messages[messages.length - 1].type === 'ai')
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        if (message.type === 'user' || message.type === 'system') {
          const list = stackRef.current
          if (
            lastScrollId.current &&
            lastScrollId.current !== message.messageId
          ) {
            scrolledToBottomRef.current = true
            setTimeout(() => {
              list && list.scrollTo(0, list.scrollHeight)
            }, 0)
          } else {
            scrolledToBottomRef.current = true
            setTimeout(() => {
              list && list.scrollTo(0, list.scrollHeight)
            }, 0)
          }
          lastScrollId.current = message.messageId
          break
        }
      }
    }
  }, [messages])
  useEffect(() => {
    const focusListener = () => {
      const list = stackRef.current
      if (list) {
        scrolledToBottomRef.current && list.scrollTo(0, list.scrollHeight)
        setTimeout(() => {
          scrolledToBottomRef.current && list.scrollTo(0, list.scrollHeight)
        }, 1000)
      }
    }

    focusListener()
    window.addEventListener('focus', focusListener)

    return () => window.removeEventListener('focus', focusListener)
  }, [])
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
      {/*<link*/}
      {/*  rel="stylesheet"*/}
      {/*  href="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css"*/}
      {/*  integrity="sha384-3UiQGuEI4TTMaFmGIZumfRPtfKQ3trwQE2JgosJxCnGmQpL/lJdjpcHkaaFwHlcI"*/}
      {/*  crossOrigin="anonymous"*/}
      {/*></link>*/}
      <style>{markdownCss}</style>
      {/*//NOTE: hide title*/}
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
        <ChatGPTAIProviderSelector />
        <GmailChatBoxProviderComponents />
        <Box ref={messageListContainerList}>
          <AppSuspenseLoadingLayout>
            {slicedMessageList.map((message) => {
              return (
                <GmailChatBoxMessageItem
                  className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
                  insertAble={insertAble}
                  replaceAble={true}
                  message={message}
                  aiAvatar={aiAvatar}
                  editAble={editAble}
                  userAvatar={userAvatar}
                  useChatGPTAble={true}
                  key={message.messageId}
                  onSave={(value) => {
                    onQuestionUpdate &&
                      onQuestionUpdate(message.messageId, value)
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
                useChatGPTAble={false}
                aiAvatar={aiAvatar}
                editAble={false}
                userAvatar={userAvatar}
              />
            )}
          </AppSuspenseLoadingLayout>
        </Box>
      </Box>
      {/*// input height*/}
      <Box height={8} flexShrink={0} />
      <Stack
        className={'use-chat-gpt-ai__chat-box__input-box'}
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
            {!loading && slicedMessageList.length > 0 && (
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
                    }}
                  >
                    <CleanChatBoxIcon
                      sx={{ color: 'inherit', fontSize: 'inherit' }}
                    />
                  </TooltipButton>
                </Box>
                {reGenerateAble && (
                  <Button
                    disableElevation
                    startIcon={<CachedIcon />}
                    variant={'outlined'}
                    disabled={loading}
                    onClick={() => {
                      onReGenerate && onReGenerate()
                    }}
                  >
                    Regenerate
                  </Button>
                )}
                {isShowContinueButton && (
                  <Button
                    disableElevation
                    startIcon={<ContextMenuIcon icon={'FastForward'} />}
                    variant={'outlined'}
                    disabled={loading}
                    onClick={() => {
                      handleSendMessage &&
                        handleSendMessage('Continue', {
                          includeHistory: true,
                          regenerate: false,
                        })
                    }}
                  >
                    Continue
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
            sx={{
              minHeight: 121,
            }}
            stopPropagation
            loading={loading}
            onEnter={handleSendMessage}
          >
            <GmailChatBoxInputActions onSendMessage={handleSendMessage} />
          </AutoHeightTextarea>
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{ width: '100%' }}
          spacing={2}
          justifyContent={'space-between'}
        >
          <Typography sx={{ flexShrink: 0 }} fontSize={12}>
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
          <GmailChatBoxReleaseLog />
        </Stack>
      </Stack>
    </Stack>
  )
}

export { GmailChatBox }
