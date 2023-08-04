import React, { FC, useEffect, useState, useRef } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { getMediator } from '@/store/InputMediator'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { getAppRootElement, numberWithCommas } from '@/utils'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import { isEzMailApp, ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import TooltipButton from '@/components/TooltipButton'
import { useTranslation } from 'react-i18next'
import useChatInputMaxTokens from '@/features/sidebar/hooks/useChatInputMaxTokens'

const SidebarChatBoxInputActions: FC<{
  onSendMessage?: (message: string, options: IUserChatMessageExtraType) => void
}> = (props) => {
  const { onSendMessage } = props
  const { t } = useTranslation(['common', 'client'])
  const { currentMaxInputLength, isError } = useChatInputMaxTokens(
    'chatBoxInputMediator',
  )
  const [inputValue, setInputValue] = useState('')
  const conversation = useRecoilValue(ChatGPTConversationState)
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
    getMediator('chatBoxInputMediator').subscribe(handleInputUpdate)
    return () => {
      getMediator('chatBoxInputMediator').unsubscribe(handleInputUpdate)
    }
  }, [])
  useEffect(() => {
    nextMessageIsActionRef.current = false
    metaDataRef.current = {}
  }, [conversation.loading])
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
        color={isError ? 'rgb(239, 83, 80)' : 'text.secondary'}
        fontSize={12}
        // 用等宽字体，不然会左右闪烁宽度
        fontFamily={'Roboto,RobotoDraft,Helvetica,Arial,sans-serif!important'}
      >
        {conversation.loading ? 0 : numberWithCommas(inputValue.length, 0)}/
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
        {/*<DevContent>*/}
        {/*  <TestAllActionsButton />*/}
        {/*</DevContent>*/}
        {!isEzMailApp && !conversation.loading && (
          <FloatingInputButton
            onBeforeShowContextMenu={() => {
              return {
                template: inputValue || ' ',
                target:
                  getAppRootElement()?.querySelector(
                    `#${ROOT_CHAT_BOX_INPUT_ID}`,
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
          disabled={conversation.loading}
          onClick={() => {
            onSendMessage &&
              onSendMessage(inputValue, {
                includeHistory: !nextMessageIsActionRef.current,
                meta: metaDataRef.current,
              })
            metaDataRef.current = {}
            nextMessageIsActionRef.current = false
          }}
        >
          {conversation.loading ? (
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
