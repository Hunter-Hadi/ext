import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import { buttonClasses } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MaxAIBetaFeatureWrapper from '@/components/MaxAIBetaFeatureWrapper'
import PromptLibraryIconButton from '@/components/PromptLibraryIconButton'
import TooltipButton from '@/components/TooltipButton'
import UserUpgradeButton from '@/features/auth/components/UserUpgradeButton'
import useMaxAIBetaFeatures from '@/features/auth/hooks/useMaxAIBetaFeatures'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import { ArtifactsToggleButton } from '@/features/chatgpt/components/artifacts'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import SidebarUsePromptButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/SidebarUsePromptButton'
import { IUserChatMessageExtraType } from '@/features/indexed_db/conversations/models/Message'
import ArtConversationalModeToggle from '@/features/sidebar/components/SidebarChatBox/art_components/ArtConversationalModeToggle'
import SearchWithAICopilotToggle from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAICopilotToggle'
import SidebarChatHistoryButton from '@/features/sidebar/components/SidebarChatBox/SidebarChatHistoryButton'
import SidebarChatVoiceInputButton from '@/features/sidebar/components/SidebarChatBox/SidebarChatVoiceInputButton'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { getInputMediator } from '@/store/InputMediator'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const SidebarChatBoxInputActions: FC<{
  onSendMessage?: (message: string, options: IUserChatMessageExtraType) => void
}> = (props) => {
  const { onSendMessage } = props
  const { currentConversationAIModel } = useClientConversation()
  const { currentSidebarConversationType } = useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  const [inputValue, setInputValue] = useState('')
  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const ref = React.useRef<HTMLDivElement | null>(null)
  const nextMessageIsActionRef = useRef(false)
  const metaDataRef = useRef<any>({})
  const { maxAIBetaFeatures } = useMaxAIBetaFeatures()
  const { userSettings, setUserSettings } = useUserSettings()
  const actionsBtnColorSxMemo = useMemo(() => {
    return {
      color: 'text.secondary',
      borderColor: (t: Theme) => {
        return t.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.16)'
      },
      '&:hover': {
        color: 'primary.main',
        borderColor: 'primary.main',
      },
    } as SxProps
  }, [])

  const isPromptLibraryIconButtonShow = useMemo(() => {
    return (
      currentSidebarConversationType === 'Chat' && !smoothConversationLoading
    )
  }, [currentSidebarConversationType, smoothConversationLoading])

  const isScreenShotIconButtonShow = useMemo(() => {
    return (
      currentSidebarConversationType === 'Chat' && !smoothConversationLoading
    )
  }, [currentSidebarConversationType, smoothConversationLoading])

  const isChatHistoryIconButtonShow = useMemo(() => {
    return (
      currentSidebarConversationType !== 'Summary' &&
      !isMaxAIImmersiveChatPage() &&
      !smoothConversationLoading
    )
  }, [currentSidebarConversationType, smoothConversationLoading])

  const isUsePromptIconButtonShow = useMemo(() => {
    return (
      currentSidebarConversationType === 'Chat' && !smoothConversationLoading
    )
  }, [currentSidebarConversationType, smoothConversationLoading])

  useEffect(() => {
    const handleInputUpdate = (newInputValue: string, metaData: any) => {
      console.log(metaData)
      if (metaData) {
        metaDataRef.current = metaData
      }
      if (newInputValue.startsWith('``NO_HISTORY_&#``\n')) {
        newInputValue = newInputValue.replace('``NO_HISTORY_&#``\n', '')
        nextMessageIsActionRef.current = true
      }
      setInputValue(newInputValue)
    }
    getInputMediator('chatBoxInputMediator').subscribe(handleInputUpdate)
    return () => {
      getInputMediator('chatBoxInputMediator').unsubscribe(handleInputUpdate)
    }
  }, [])

  useEffect(() => {
    nextMessageIsActionRef.current = false
    metaDataRef.current = {}
  }, [smoothConversationLoading])

  return (
    <Stack
      component={'div'}
      ref={ref}
      p={1}
      pt={0}
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      width={'100%'}
    >
      {(currentSidebarConversationType === 'Chat' ||
        currentSidebarConversationType === 'Search' ||
        currentSidebarConversationType === 'Art') && (
        <AIProviderModelSelectorButton
          sidebarConversationType={currentSidebarConversationType}
        />
      )}

      {/* Upgrade */}
      <UserUpgradeButton />

      <Box
        component={'div'}
        display={'flex'}
        width={0}
        flex={1}
        alignItems={'center'}
        justifyContent={'end'}
        gap={1}
      >
        {/* chat artifacts btn */}
        {currentSidebarConversationType === 'Chat' &&
          maxAIBetaFeatures.enabled_artifacts &&
          currentConversationAIModel === 'claude-3-5-sonnet' &&
          !smoothConversationLoading && (
            <ArtifactsToggleButton
              onChange={async (enabled) => {
                await setUserSettings({
                  ...userSettings,
                  features: {
                    ...userSettings?.features,
                    artifacts: {
                      ...userSettings?.features?.artifacts,
                      enabled,
                    },
                  },
                })
              }}
              checked={userSettings?.features?.artifacts?.enabled || false}
            />
          )}
        {/* search copilot btn */}
        {currentSidebarConversationType === 'Search' &&
          !smoothConversationLoading && <SearchWithAICopilotToggle />}

        {/* art copilot button */}
        {currentSidebarConversationType === 'Art' &&
          !smoothConversationLoading && <ArtConversationalModeToggle />}

        {/* chat history btn */}
        <SidebarChatHistoryButton
          sx={{
            ...actionsBtnColorSxMemo,
            visibility: isChatHistoryIconButtonShow ? 'visible' : 'hidden',
            position: isChatHistoryIconButtonShow ? 'relative' : 'absolute',
            [`&.${buttonClasses.contained}`]: {
              color: 'white',
            },
          }}
        />

        {/* screenshot btn */}
        <SidebarScreenshotButton
          sx={{
            ...actionsBtnColorSxMemo,
            visibility: isScreenShotIconButtonShow ? 'visible' : 'hidden',
            position: isScreenShotIconButtonShow ? 'relative' : 'absolute',
          }}
        />

        {/* prompt library btn */}
        <PromptLibraryIconButton
          sx={{
            ...actionsBtnColorSxMemo,
            visibility: isPromptLibraryIconButtonShow ? 'visible' : 'hidden',
            position: isPromptLibraryIconButtonShow ? 'relative' : 'absolute',
            [`&.${buttonClasses.contained}`]: {
              color: 'white',
            },
          }}
        />

        {/* use prompt btn */}

        <Box
          sx={{
            display: isUsePromptIconButtonShow ? 'flex' : 'none',
          }}
        >
          <SidebarUsePromptButton
            sx={{
              ...actionsBtnColorSxMemo,
              [`&.${buttonClasses.contained}`]: {
                color: 'white',
              },
            }}
            text={inputValue}
          />
        </Box>

        {/* voice input btn */}

        <MaxAIBetaFeatureWrapper betaFeatureName={'voice_input'}>
          <Box
            sx={{
              display: isUsePromptIconButtonShow ? 'flex' : 'none',
            }}
          >
            <SidebarChatVoiceInputButton
              sx={{
                ...actionsBtnColorSxMemo,
                [`&.${buttonClasses.contained}`]: {
                  color: 'white',
                },
              }}
            />
          </Box>
        </MaxAIBetaFeatureWrapper>

        {/* send btn */}
        <TooltipButton
          title={t(`client:sidebar__button__send_to_ai`)}
          TooltipProps={{
            description: '⏎',
          }}
          sx={{ minWidth: 'unset', p: 1 }}
          disableElevation
          variant={'contained'}
          disabled={smoothConversationLoading}
          onClick={() => {
            // value 没有值或者都是空格时不触发 ask
            onSendMessage &&
              onSendMessage(inputValue, {
                includeHistory: !nextMessageIsActionRef.current,
                meta: metaDataRef.current,
              })
            metaDataRef.current = {}
            nextMessageIsActionRef.current = false
          }}
          data-testid={'sidebar_actions__send_btn'}
        >
          {smoothConversationLoading ? (
            <CircularProgress size={16} />
          ) : (
            <SendIcon sx={{ fontSize: '16px' }} />
          )}
        </TooltipButton>
      </Box>
    </Stack>
  )
}

export default SidebarChatBoxInputActions
