import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import CachedIcon from '@mui/icons-material/Cached'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
// import SendIcon from '@mui/icons-material/Send'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
// import { numberWithCommas } from '@/utils'
// import { useRecoilValue } from 'recoil'
// import { ChatGPTConversationState } from '@/features/sidebar/store'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
// import DevContent from '@/components/DevContent'
// import { TestAllActionsButton } from '@/features/shortcuts'
import throttle from 'lodash-es/throttle'
import {
  IChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import SidebarChatBoxInputActions from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxInputActions'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import useSliceMessageList from '../../hooks/useSliceMessageList'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import SidebarChatBoxChatSpeedDial from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxChatSpeedDial'
import { clientRestartChromeExtension, getAppRootElement } from '@/utils'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import AIProviderSelectorFloatingButton from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderSelectorFloatingButton'
import { useTranslation } from 'react-i18next'
import SidebarTabs from '@/features/sidebar/components/SidebarTabs'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import SidebarChatBoxFooter from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxFooter'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import SearchWithAIAdvanced from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIAdvanced'
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
  onSendMessage?: (text: string, options: IUserChatMessageExtraType) => void
  onRetry?: (messageId: string) => void
  loading?: boolean
}

const SidebarChatBoxMessageItem = React.lazy(
  () =>
    import(
      '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageItem'
    ),
)

const SidebarChatBox: FC<IGmailChatBoxProps> = (props) => {
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
  const [isSetVariables, setIsSetVariables] = useState(false)
  const { t } = useTranslation(['common', 'client'])
  // const conversation = useRecoilValue(ChatGPTConversationState)
  const stackRef = useRef<HTMLElement | null>(null)
  const messageListContainerList = useRef<HTMLElement | null>(null)
  const [isShowContinueButton, setIsShowContinueButton] = React.useState(false)
  const { slicedMessageList, changePageNumber } = useSliceMessageList(
    messageListContainerList,
    messages,
  )
  const { currentSidebarConversationType } = useSidebarSettings()
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
    (value: string, options: IUserChatMessageExtraType) => {
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
        if (message) {
          // if (message.type === 'user' || message.type === 'system') {
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
        <SidebarTabs />
        <Box ref={messageListContainerList}>
          <AppSuspenseLoadingLayout>
            {slicedMessageList.map((message, index) => {
              return (
                <SidebarChatBoxMessageItem
                  className={`use-chat-gpt-ai__message-item use-chat-gpt-ai__message-item--${message.type}`}
                  insertAble={insertAble}
                  replaceAble={true}
                  message={message}
                  aiAvatar={aiAvatar}
                  editAble={editAble}
                  userAvatar={userAvatar}
                  useChatGPTAble={true}
                  key={
                    message.messageId + '_sidebar_chat_message_' + String(index)
                  }
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
              <SidebarChatBoxMessageItem
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
            <SidebarChatBoxChatSpeedDial
              disabledMainButton={loading}
              onClick={async (type) => {
                if (type === 'focus') {
                  const chatInput = getAppRootElement()?.querySelector(
                    `#${ROOT_CHAT_BOX_INPUT_ID}`,
                  ) as HTMLTextAreaElement
                  chatInput && chatInput.focus()
                } else if (type === 'new') {
                  onReset && onReset()
                } else if (type === 'restart') {
                  await clientRestartChromeExtension()
                }
              }}
            />
            <AIProviderSelectorFloatingButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
            />
            <SearchWithAIAdvanced
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
            />
            {!loading && slicedMessageList.length > 0 && (
              <>
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
                    {t('client:sidebar__button__regenerate')}
                  </Button>
                )}
                {isShowContinueButton &&
                  currentSidebarConversationType !== 'Search' && (
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
                      {t('client:sidebar__button__continue')}
                    </Button>
                  )}
              </>
            )}
            {loading && (
              <Button
                sx={{ mb: 1 }}
                disableElevation
                variant={'outlined'}
                startIcon={<StopOutlinedIcon />}
                onClick={() => {
                  onStopGenerate && onStopGenerate()
                }}
              >
                {t('client:sidebar__button__stop_generating')}
              </Button>
            )}
          </Box>
          <ActionSetVariablesModal
            onClose={() => {
              setIsSetVariables(false)
            }}
            onShow={() => setIsSetVariables(true)}
            modelKey={'Sidebar'}
          />
          <AutoHeightTextarea
            sx={{
              minHeight: isSetVariables ? 0 : 80,
              height: isSetVariables ? '0!important' : 'unset',
              visibility: isSetVariables ? 'hidden' : 'visible',
            }}
            stopPropagation
            loading={loading}
            expandNode={
              currentSidebarConversationType === 'Chat' ? (
                <ChatIconFileUpload direction={'column'} size={'small'} />
              ) : null
            }
            onEnter={handleSendMessage}
          >
            <SidebarChatBoxInputActions onSendMessage={handleSendMessage} />
          </AutoHeightTextarea>
        </Stack>
        <SidebarChatBoxFooter />
      </Stack>
    </Stack>
  )
}

export default SidebarChatBox
