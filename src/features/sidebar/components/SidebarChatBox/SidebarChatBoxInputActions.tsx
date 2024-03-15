import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import { buttonClasses } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import PromptLibraryIconButton from '@/components/PromptLibraryIconButton'
import TooltipButton from '@/components/TooltipButton'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import ArtConversationalModeToggle from '@/features/sidebar/components/SidebarChatBox/art_components/ArtConversationalModeToggle'
import SearchWithAICopilotToggle from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAICopilotToggle'
import SidebarChatHistoryButton from '@/features/sidebar/components/SidebarChatBox/SidebarChatHistoryButton'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getInputMediator } from '@/store/InputMediator'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const SidebarChatBoxInputActions: FC<{
  onSendMessage?: (message: string, options: IUserChatMessageExtraType) => void
}> = (props) => {
  const { onSendMessage } = props
  const { currentSidebarConversationType } = useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  const [inputValue, setInputValue] = useState('')
  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const ref = React.useRef<HTMLElement | null>(null)
  const nextMessageIsActionRef = useRef(false)
  const metaDataRef = useRef<any>({})

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
      {currentSidebarConversationType === 'Chat' && (
        <AIProviderModelSelectorButton sidebarConversationType={'Chat'} />
      )}
      {currentSidebarConversationType === 'Art' && (
        <AIProviderModelSelectorButton sidebarConversationType={'Art'} />
      )}
      <Typography
        component={'span'}
        color={'text.secondary'}
        fontSize={12}
        // 用等宽字体，不然会左右闪烁宽度
        fontFamily={'Roboto,RobotoDraft,Helvetica,Arial,sans-serif!important'}
      >
        {/*{Math.floor(currentMaxInputLength / 1000) + 'k '}*/}
        {/*{t('client:sidebar__input__tokens_limited__title')}*/}
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
        {/* search copilot btn */}
        {currentSidebarConversationType === 'Search' &&
          !smoothConversationLoading && <SearchWithAICopilotToggle />}

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

        {/* art */}
        {currentSidebarConversationType === 'Art' &&
          !smoothConversationLoading && <ArtConversationalModeToggle />}

        {/* use prompt btn */}
        {currentSidebarConversationType === 'Chat' &&
          !smoothConversationLoading && (
            <FloatingInputButton
              sx={actionsBtnColorSxMemo}
              onBeforeShowContextMenu={() => {
                return {
                  template: inputValue || ' ',
                  target:
                    getMaxAISidebarRootElement()?.querySelector(
                      `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
                    )?.parentElement || (ref.current as HTMLElement),
                }
              }}
            />
          )}

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
            if (inputValue && inputValue.trim()) {
              // value 没有值或者都是空格时不触发 ask
              onSendMessage &&
                onSendMessage(inputValue, {
                  includeHistory: !nextMessageIsActionRef.current,
                  meta: metaDataRef.current,
                })
              metaDataRef.current = {}
              nextMessageIsActionRef.current = false
            }
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
