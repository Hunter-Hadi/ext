import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import PromptLibraryIconButton from '@/components/PromptLibraryIconButton'
import TooltipButton from '@/components/TooltipButton'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import SearchWithAICopilotToggle from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAICopilotToggle'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getInputMediator } from '@/store/InputMediator'

const SidebarChatBoxInputActions: FC<{
  onSendMessage?: (message: string, options: IUserChatMessageExtraType) => void
}> = (props) => {
  const { onSendMessage } = props
  const { currentSidebarConversationType } = useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  const [inputValue, setInputValue] = useState('')
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const ref = React.useRef<HTMLElement>(null)
  const nextMessageIsActionRef = useRef(false)
  const metaDataRef = useRef<any>({})
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
      ref={ref}
      p={1}
      pt={0}
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      width={'100%'}
    >
      <Typography
        component={'span'}
        color={'text.secondary'}
        fontSize={12}
        // 用等宽字体，不然会左右闪烁宽度
        fontFamily={'Roboto,RobotoDraft,Helvetica,Arial,sans-serif!important'}
      >
        {/* TODO: AI provider迁移到这个地方选择*/}
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
        {currentSidebarConversationType === 'Search' &&
          !smoothConversationLoading && <SearchWithAICopilotToggle />}
        <PromptLibraryIconButton
          sx={{
            visibility:
              currentSidebarConversationType === 'Chat' &&
              !smoothConversationLoading
                ? 'visible'
                : 'hidden',
          }}
        />
        {currentSidebarConversationType === 'Chat' &&
          !smoothConversationLoading && (
            <FloatingInputButton
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
