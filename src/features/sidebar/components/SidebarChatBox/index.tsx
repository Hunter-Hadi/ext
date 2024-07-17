import CachedIcon from '@mui/icons-material/Cached'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AutoHeightTextarea, {
  LINE_HEIGHT,
  TEXTAREA_PADDING_Y,
} from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DevContent from '@/components/DevContent'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import { getLastRunShortcuts } from '@/features/chatgpt/hooks/useClientChat'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import {
  IChatMessage,
  IUserChatMessageExtraType,
} from '@/features/indexed_db/conversations/models/Message'
import SidebarSummarySuggestion from '@/features/onboarding/components/SidebarSummarySuggestion'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import SidebarAIAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced'
import SidebarChatBoxChatSpeedDial from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxChatSpeedDial'
import SidebarChatBoxFooter from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxFooter'
import SidebarChatBoxInputActions from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxInputActions'
import SidebarChatBoxMessageListContainer from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import SidebarHomeView from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView'
import SidebarHeader from '@/features/sidebar/components/SidebarHeader'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import {
  clientRestartChromeExtension,
  getMaxAISidebarRootElement,
} from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IGmailChatBoxProps {
  sx?: SxProps
  onReGenerate?: () => void
  onStopGenerate?: () => void
  onReset?: () => void
  conversationId?: string
  conversationType?: ISidebarConversationType
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
  onSendMessage?: (text: string, options: IUserChatMessageExtraType) => void
  onRetry?: (messageId: string) => void
  loading?: boolean
  /**
   * 表示是否在切换过程中，因为conversationType和conversationId并不是同步切换的，
   * conversationType会比conversationId切换得更快，
   * 所以使用clientConversation.type(来自useClientConversation) !== currentConversationType(来自useSidebarSettings)来判断是否在切换的过程中
   */
  switching?: boolean
}

const SidebarChatBox: FC<IGmailChatBoxProps> = (props) => {
  const {
    sx,
    onReGenerate,
    onStopGenerate,
    onSendMessage,
    conversationId,
    conversationType,
    writingMessage,
    messages,
    onReset,
    loading,
    switching = false,
  } = props
  // const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false)
  // const [isFetchNextPage, setIsFetchNextPage] = useState(false)
  const [isSettingVariables, setIsSettingVariables] = useState(false)
  const [isShowRegenerateButton, setIsShowRegenerateButton] = useState(true)
  const [isShowContinueButton, setIsShowContinueButton] = useState(false)
  const { updateSidebarConversationType, currentSidebarConversationType } =
    useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  const textareaPlaceholder = useMemo(() => {
    if (conversationType === 'Summary') {
      const pageSummaryType = getPageSummaryType()
      switch (pageSummaryType) {
        case 'PAGE_SUMMARY':
          return t('client:sidebar__input__summary__page_placeholder')
        case 'YOUTUBE_VIDEO_SUMMARY':
          return t('client:sidebar__input__summary__video_placeholder')
        case 'DEFAULT_EMAIL_SUMMARY':
          return t('client:sidebar__input__summary__email_placeholder')
        case 'PDF_CRX_SUMMARY':
          return t('client:sidebar__input__summary__pdf_placeholder')
        default:
          return t('client:sidebar__input__summary__page_placeholder')
      }
    }
    if (conversationType === 'Search') {
      return t('client:sidebar__input__search__placeholder')
    }
    if (conversationType === 'Art') {
      return t('client:sidebar__input__art__placeholder')
    }
    return t('client:sidebar__input__chat__placeholder')
  }, [conversationType, t])

  const shortcutsActionBtnSxMemo = useMemo<SxProps<Theme>>(() => {
    return {
      borderRadius: 2,
      borderColor: 'primary.main',
      color: (t: Theme) => {
        return t.palette.mode === 'dark' ? '#fff' : 'primary.main'
      },
      '&:hover': {
        color: 'customColor.hoverColor',
        borderColor: 'primary.main',
      },
    }
  }, [])
  /**
   * 因为messages的消息来源有3个步骤
   * 1. 切换conversationId
   * 2. 基于conversationId过滤messages
   * 3. react-query基于conversationId请求messages
   * * 所以下方的loading状态有3个步骤, 为了不让HomeView闪烁
   */
  // 切换conversation的时候，先切换了conversationType，又切换了id，所以要先给一个2
  // const switchConversationRef = useRef(false)
  // useEffect(() => {
  //   switchConversationRef.current = true
  // }, [conversationType])
  // const [messagesLoadingStep, setMessagesLoadingStep] = useState(0)
  // useEffect(() => {
  //   if (conversationId) {
  //     if (switchConversationRef.current) {
  //       switchConversationRef.current = false
  //       setMessagesLoadingStep(2)
  //     } else {
  //       setMessagesLoadingStep(1)
  //     }
  //   }
  // }, [conversationId])
  //
  // useEffect(() => {
  //   setMessagesLoadingStep((prevState) => {
  //     return prevState + 1
  //   })
  // }, [messages])

  const isShowChatBoxHomeView = useMemo(() => {
    // console.log('isShowChatBoxHomeView', messagesLoadingStep)
    // TODO fix: 需要修复 第一次切换 conversationId 时，SidebarHomeView 会闪烁的问题
    // 具体问题是因为，在第一次切换 conversationId 时，会有一个瞬间
    // isLoadingChatMessages 和 isFetchNextPage 等于 false，并且 messages.length 等于 0
    // messages[0].conversationId === conversationId

    // console.log(
    //   'isShowChatBoxHomeView',
    //   isLoadingChatMessages,
    //   isFetchNextPage,
    //   messages,
    // )
    // if (messagesLoadingStep <= 2) {
    //   return false
    // }
    if (loading || switching) {
      return false
    }
    return (
      messages.length <= 0 && !writingMessage && conversationType !== 'Summary'
    )
  }, [loading, switching, messages.length, writingMessage, conversationType])

  const handleSwitchToSummary = () => {
    updateSidebarConversationType('Summary')
  }

  const handleSendMessage = useCallback(
    (value: string, options: IUserChatMessageExtraType) => {
      onSendMessage?.(value, options)
    },
    [onSendMessage],
  )

  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      const lastMessage =
        new Date(messages[0].updated_at!).getTime() >
        new Date(messages[messages.length - 1].updated_at!).getTime()
          ? messages[0]
          : messages[messages.length - 1]

      setIsShowContinueButton(lastMessage.type === 'ai')
      getLastRunShortcuts(conversationId).then((result) => {
        if (result.lastRunActions.length > 0) {
          setIsShowRegenerateButton(true)
        } else {
          setIsShowRegenerateButton(false)
        }
      })
    } else {
      setIsShowContinueButton(false)
      setIsShowRegenerateButton(false)
    }
  }, [messages, conversationId])

  console.log('', writingMessage)

  return (
    <Stack
      id={'maxAISidebarChatBox'}
      data-conversation-type={currentSidebarConversationType}
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
      <DevContent>
        <DevConsole isSidebar />
      </DevContent>
      <SidebarHeader />

      <SidebarHomeView
        isSettingVariables={isSettingVariables}
        isShowChatBoxHomeView={isShowChatBoxHomeView}
        sx={
          // 这么做条件渲染是为了，让 内部组件的 useEffect 可以完整的执行，不会被卸载
          !isShowChatBoxHomeView
            ? {
                display: 'none',
              }
            : null
        }
      />

      {conversationId ? (
        <SidebarChatBoxMessageListContainer
          // onLoadingChatMessages={setIsLoadingChatMessages}
          // onFetchingNextPage={setIsFetchNextPage}
          conversationId={conversationId}
          isAIResponding={loading}
          writingMessage={writingMessage}
          sx={{
            textAlign: 'left',
          }}
        />
      ) : null}

      {(conversationType !== 'ContextMenu' || !isShowChatBoxHomeView) && (
        <>
          <SidebarSummarySuggestion onClick={handleSwitchToSummary} />

          <Stack
            className={'use-chat-gpt-ai__chat-box__input-box'}
            position={'relative'}
            mt={'auto'}
            justifyContent={'end'}
            alignItems={'center'}
            minHeight={192}
            spacing={1}
            flexShrink={0}
            // bgcolor={'#fff'}
          >
            <Stack
              maxWidth={isInImmersiveChat ? '768px' : 'initial'}
              p={1}
              width={'100%'}
              alignItems={'center'}
              justifyContent={'center'}
            >
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
                minHeight={40}
              >
                <SidebarChatBoxChatSpeedDial
                  disabledMainButton={loading}
                  onClick={async (type) => {
                    if (type === 'focus') {
                      const chatInput =
                        getMaxAISidebarRootElement()?.querySelector(
                          `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
                        ) as HTMLTextAreaElement
                      chatInput && chatInput.focus()
                    } else if (type === 'new') {
                      onReset?.()
                    } else if (type === 'restart') {
                      await clientRestartChromeExtension()
                    }
                  }}
                />

                <SidebarAIAdvanced
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                  }}
                />

                {!loading && isShowRegenerateButton && (
                  <Button
                    disableElevation
                    startIcon={<CachedIcon />}
                    variant={'normalOutlined'}
                    disabled={loading}
                    onClick={() => {
                      onReGenerate?.()
                    }}
                    sx={shortcutsActionBtnSxMemo}
                    data-testid='sidebar_actions__regenerate'
                  >
                    {t('client:sidebar__button__regenerate')}
                  </Button>
                )}
                {!loading &&
                  conversationType !== 'Search' &&
                  conversationType !== 'Art' &&
                  isShowContinueButton && (
                    <Button
                      disableElevation
                      startIcon={<ContextMenuIcon icon={'FastForward'} />}
                      variant={'normalOutlined'}
                      disabled={loading}
                      onClick={() => {
                        handleSendMessage &&
                          handleSendMessage('Continue', {
                            includeHistory: true,
                            regenerate: false,
                          })
                      }}
                      sx={shortcutsActionBtnSxMemo}
                      data-testid='sidebar_actions__continue'
                    >
                      {t('client:sidebar__button__continue')}
                    </Button>
                  )}
                {loading && writingMessage && (
                  <Button
                    sx={shortcutsActionBtnSxMemo}
                    disableElevation
                    variant={'normalOutlined'}
                    startIcon={<StopOutlinedIcon />}
                    onClick={() => {
                      onStopGenerate?.()
                    }}
                    data-testid='sidebar_actions__stop_generating'
                  >
                    {t('client:sidebar__button__stop_generating')}
                  </Button>
                )}
              </Box>
              <ActionSetVariablesModal
                showModelSelector
                onChange={(_, reason) => {
                  if (reason === 'runPromptStart') {
                    setIsSettingVariables(false)
                  }
                }}
                onClose={() => setIsSettingVariables(false)}
                onShow={() => setIsSettingVariables(true)}
                modelKey={'Sidebar'}
              />
              <AutoHeightTextarea
                placeholder={textareaPlaceholder}
                minLine={3}
                sx={{
                  minHeight: isSettingVariables
                    ? 0
                    : LINE_HEIGHT * 3 + TEXTAREA_PADDING_Y * 2 + 40, // AutoHeightTextarea 最小高度 = 一行的高度 * 最小行数 + 上下的 padding + SidebarChatBoxInputActions 的高度（40）
                  height: isSettingVariables ? '0!important' : 'unset',
                  visibility: isSettingVariables ? 'hidden' : 'visible',
                }}
                stopPropagation
                loading={loading}
                expandNode={
                  conversationType === 'Chat' ? (
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
        </>
      )}
    </Stack>
  )
}

export default SidebarChatBox
