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
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import useListenAIProviderUploadError from '@/features/chatgpt/hooks/upload/useListenAIProviderUploadError'
import {
  IAIResponseMessage,
  IChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
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
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { clientRestartChromeExtension } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IGmailChatBoxProps {
  sx?: SxProps
  onReGenerate?: () => void
  onStopGenerate?: () => void
  onReset?: () => void
  messages: IChatMessage[]
  writingMessage: IChatMessage | null
  onSendMessage?: (text: string, options: IUserChatMessageExtraType) => void
  onRetry?: (messageId: string) => void
  loading?: boolean
}

const SidebarChatBox: FC<IGmailChatBoxProps> = (props) => {
  const {
    sx,
    onReGenerate,
    onStopGenerate,
    onSendMessage,
    writingMessage,
    messages,
    onReset,
    loading,
  } = props
  const [isSetVariables, setIsSetVariables] = useState(false)
  const { t } = useTranslation(['common', 'client'])
  const [isShowContinueButton, setIsShowContinueButton] = useState(false)
  const { currentSidebarConversationType, currentSidebarConversationId } =
    useSidebarSettings()
  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  const textareaPlaceholder = useMemo(() => {
    if (currentSidebarConversationType === 'Summary') {
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
    if (currentSidebarConversationType === 'Search') {
      return t('client:sidebar__input__search__placeholder')
    }
    if (currentSidebarConversationType === 'Art') {
      return t('client:sidebar__input__art__placeholder')
    }
    return t('client:sidebar__input__chat__placeholder')
  }, [currentSidebarConversationType, t])
  const shortcutsActionBtnSxMemo = useMemo(() => {
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

  const tempIsShowRegenerate = useMemo(() => {
    if (currentSidebarConversationType === 'Chat' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.type === 'ai') {
        const AIMessage = lastMessage as IAIResponseMessage
        if (AIMessage?.originalMessage?.metadata?.shareType === 'search') {
          return false
        }
      }
    }
    return true
  }, [messages, currentSidebarConversationType])

  const isShowChatBoxHomeView = useMemo(() => {
    return (
      messages.length <= 0 &&
      !writingMessage &&
      currentSidebarConversationType !== 'Summary'
    )
  }, [messages, writingMessage, currentSidebarConversationType])

  const handleSendMessage = useCallback(
    (value: string, options: IUserChatMessageExtraType) => {
      onSendMessage && onSendMessage(value, options)
    },
    [onSendMessage],
  )

  useEffect(() => {
    if (messages.length > 0) {
      setIsShowContinueButton(messages[messages.length - 1].type === 'ai')
    }
  }, [messages])
  useListenAIProviderUploadError()

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
      <DevContent>
        <DevConsole />
      </DevContent>
      <SidebarHeader />

      <SidebarHomeView
        sx={
          // 这么做条件渲染是为了，让点击事件在 isShowChatBoxHomeView 为 false 时，可以正常执行
          !isShowChatBoxHomeView
            ? {
                display: 'none',
              }
            : null
        }
      />

      {currentSidebarConversationId && messages.length > 0 ? (
        <SidebarChatBoxMessageListContainer
          conversationId={currentSidebarConversationId}
          loading={loading}
          messages={messages}
          writingMessage={writingMessage}
          sx={{
            textAlign: 'left',
          }}
        />
      ) : null}

      <Stack
        className={'use-chat-gpt-ai__chat-box__input-box'}
        position={'relative'}
        mt={'auto'}
        justifyContent={'end'}
        alignItems={'center'}
        minHeight={170}
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
          >
            <SidebarChatBoxChatSpeedDial
              disabledMainButton={loading}
              onClick={async (type) => {
                if (type === 'focus') {
                  const chatInput = getMaxAISidebarRootElement()?.querySelector(
                    `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
                  ) as HTMLTextAreaElement
                  chatInput && chatInput.focus()
                } else if (type === 'new') {
                  onReset && onReset()
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

            {!loading && messages.length > 0 && tempIsShowRegenerate && (
              <>
                <Button
                  disableElevation
                  startIcon={<CachedIcon />}
                  variant={'normalOutlined'}
                  disabled={loading}
                  onClick={() => {
                    onReGenerate && onReGenerate()
                  }}
                  sx={shortcutsActionBtnSxMemo}
                  data-testid="sidebar_actions__regenerate"
                >
                  {t('client:sidebar__button__regenerate')}
                </Button>
                {isShowContinueButton &&
                  currentSidebarConversationType !== 'Search' &&
                  currentSidebarConversationType !== 'Art' && (
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
                      data-testid="sidebar_actions__continue"
                    >
                      {t('client:sidebar__button__continue')}
                    </Button>
                  )}
              </>
            )}
            {loading && (
              <Button
                sx={shortcutsActionBtnSxMemo}
                disableElevation
                variant={'normalOutlined'}
                startIcon={<StopOutlinedIcon />}
                onClick={() => {
                  onStopGenerate && onStopGenerate()
                }}
                data-testid="sidebar_actions__stop_generating"
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
            placeholder={textareaPlaceholder}
            minLine={3}
            sx={{
              minHeight: isSetVariables
                ? 0
                : LINE_HEIGHT * 3 + TEXTAREA_PADDING_Y * 2 + 40, // AutoHeightTextarea 最小高度 = 一行的高度 * 最小行数 + 上下的 padding + SidebarChatBoxInputActions 的高度（40）
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
