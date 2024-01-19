import CachedIcon from '@mui/icons-material/Cached'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DevContent from '@/components/DevContent'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import {
  IAIResponseMessage,
  IChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import ArtTextToImageAdvanced from '@/features/sidebar/components/SidebarChatBox/art_components/ArtTextToImageAdvanced'
import SearchWithAIAdvanced from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIAdvanced'
import SidebarChatBoxChatSpeedDial from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxChatSpeedDial'
import SidebarChatBoxFooter from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxFooter'
import SidebarChatBoxInputActions from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxInputActions'
import SidebarChatBoxMessageListContainer from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import SidebarHeader from '@/features/sidebar/components/SidebarHeader'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { SidebarPageState } from '@/features/sidebar/store'
import { clientRestartChromeExtension } from '@/utils'

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
  const [isShowContinueButton, setIsShowContinueButton] = React.useState(false)
  const { currentSidebarConversationType } = useSidebarSettings()

  const setSidebarPageState = useSetRecoilState(SidebarPageState)

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

  const handleSendMessage = useCallback(
    (value: string, options: IUserChatMessageExtraType) => {
      // 新的消息发送时，重置消息列表的页码
      setSidebarPageState((preState) => ({
        ...preState,
        messageListPageNum: 1,
      }))
      onSendMessage && onSendMessage(value, options)
    },
    [onSendMessage],
  )

  useEffect(() => {
    if (messages.length > 0) {
      setIsShowContinueButton(messages[messages.length - 1].type === 'ai')
    }
  }, [messages])

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
      <SidebarChatBoxMessageListContainer
        loading={loading}
        messages={messages}
        writingMessage={writingMessage}
        sx={{
          textAlign: 'left',
        }}
      />
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

            <SearchWithAIAdvanced
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
            />
            <ArtTextToImageAdvanced
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
                  variant={'outlined'}
                  disabled={loading}
                  onClick={() => {
                    onReGenerate && onReGenerate()
                  }}
                >
                  {t('client:sidebar__button__regenerate')}
                </Button>
                {isShowContinueButton &&
                  currentSidebarConversationType !== 'Search' &&
                  currentSidebarConversationType !== 'Art' && (
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
