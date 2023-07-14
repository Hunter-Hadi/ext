import React, { FC, useEffect, useState, useMemo, useRef } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { getMediator } from '@/store/InputMediator'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import { getAppRootElement, numberWithCommas } from '@/utils'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import { isEzMailApp, ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import TooltipButton from '@/components/TooltipButton'

// const MAX_NORMAL_INPUT_LENGTH = 10000
// const MAX_GPT4_INPUT_LENGTH = 80000

const GmailChatBoxInputActions: FC<{
  onSendMessage?: (message: string, options: IUserChatMessageExtraType) => void
}> = (props) => {
  const { onSendMessage } = props
  const [inputValue, setInputValue] = useState('')
  const conversation = useRecoilValue(ChatGPTConversationState)
  const ref = React.useRef<HTMLElement>(null)
  const nextMessageIsActionRef = useRef(false)
  const currentMaxInputLength = useMemo(() => {
    // NOTE: GPT-4 最大输入长度为 80000，GPT-3 最大输入长度为 10000, 我们后端最多6000，所以这里写死4000
    return 4000
    // return conversation.model === 'gpt-4'
    //   ? MAX_GPT4_INPUT_LENGTH
    //   : MAX_NORMAL_INPUT_LENGTH
  }, [])
  const isGmailChatBoxError = useMemo(() => {
    return inputValue.length > currentMaxInputLength
  }, [inputValue, currentMaxInputLength])
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
        color={isGmailChatBoxError ? 'rgb(239, 83, 80)' : 'text.secondary'}
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
          title={'Send to AI'}
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
export default GmailChatBoxInputActions
