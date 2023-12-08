import CachedIcon from '@mui/icons-material/Cached'
// import SendIcon from '@mui/icons-material/Send'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
// import DevContent from '@/components/DevContent'
// import { TestAllActionsButton } from '@/features/shortcuts'
import throttle from 'lodash-es/throttle'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DevContent from '@/components/DevContent'
// import { numberWithCommas } from '@/utils'
// import { useRecoilValue } from 'recoil'
// import { ChatGPTConversationState } from '@/features/sidebar/store'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
import AIProviderSelectorFloatingButton from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderSelectorFloatingButton'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import {
  IAIResponseMessage,
  IChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { getAppRootElement } from '@/features/common/utils'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import SearchWithAIAdvanced from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIAdvanced'
import SidebarChatBoxChatSpeedDial from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxChatSpeedDial'
import SidebarChatBoxFooter from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxFooter'
import SidebarChatBoxInputActions from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxInputActions'
import SidebarHeader from '@/features/sidebar/components/SidebarHeader'
import SidebarTabs from '@/features/sidebar/components/SidebarTabs'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { clientRestartChromeExtension } from '@/utils'

import useSliceMessageList from '../../hooks/useSliceMessageList'
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

const messageListContainerId = 'message-list-container'
const scrollContainerId = 'scroll-message-container'

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
  // const messageListContainerList = useRef<HTMLElement | null>(null)
  const [isShowContinueButton, setIsShowContinueButton] = React.useState(false)
  // console.log(`messageListContainerList`, messageListContainerList, messages)
  const { slicedMessageList, changePageNumber } = useSliceMessageList(
    scrollContainerId,
    messageListContainerId,
    messages,
  )
  const { currentSidebarConversationType } = useSidebarSettings()
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

  useEffect(() => {
    if (loading) {
      // 这里的 scrollToBottom 需要兼容 search / summary 的情况
      // 当在 loading 时，如果最后一条消息是 search / summary
      // 判断 scrolledToBottomRef.current 为 true 时滚动到底部
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        const lastMessageOriginalData = (lastMessage as IAIResponseMessage)
          ?.originalMessage
        if (
          lastMessageOriginalData &&
          (lastMessageOriginalData.metadata?.shareType === 'search' ||
            lastMessageOriginalData.metadata?.shareType === 'summary')
        ) {
          const list = stackRef.current
          if (scrolledToBottomRef.current && list) {
            list.scrollTo(0, list.scrollHeight)
          }
        }
      }
    }
  }, [loading, messages])

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

  console.log('scrolledToBottomRef.current', scrolledToBottomRef.current)
  const tempIsShowRegenerate = useMemo(() => {
    if (
      currentSidebarConversationType === 'Chat' &&
      slicedMessageList.length > 0
    ) {
      const lastMessage = slicedMessageList[messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        const AIMessage = lastMessage as IAIResponseMessage
        if (AIMessage?.originalMessage?.metadata?.shareType === 'search') {
          return false
        }
      }
    }
    return true
  }, [slicedMessageList, currentSidebarConversationType])
  return (
    <Stack
      id={'maxAISidebarChatBox'}
      position={'relative'}
      sx={{
        height: 0,
        flex: 1,
        '& .MuiButton-root': {
          textTransform: 'none',
        },
        ...sx,
      }}
    >
      <Box
        ref={stackRef}
        flex={1}
        height={0}
        sx={{
          textAlign: 'left',
          overflowY: 'auto',
        }}
        id={scrollContainerId}
      >
        <SidebarTabs />
        <DevContent>
          <DevConsole />
        </DevContent>
        <SidebarHeader />
        {/* 这个 Box 只能包含 message item */}
        <Box id={messageListContainerId}>
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
            {!loading && slicedMessageList.length > 0 && tempIsShowRegenerate && (
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
