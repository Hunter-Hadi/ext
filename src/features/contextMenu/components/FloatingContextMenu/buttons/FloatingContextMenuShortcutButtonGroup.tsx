import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRecoilValue } from 'recoil'

// import { AppState } from '@/store'
// import { hideChatBox, isShowChatBox, showChatBox } from '@/utils'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { FloatingContextMenuOpenSidebarButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuOpenSidebarButton'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { ChatGPTConversationState } from '@/features/sidebar/store'

type FloatingContextMenuShortcutKey = 's' | 'r' | 'o' | 'c'

const FloatingContextMenuShortcutButtonGroup: FC = () => {
  // const appState = useRecoilValue(AppState)
  const chatGPTConversation = useRecoilValue(ChatGPTConversationState)
  const needRegenerateRef = useRef(false)
  const isGenerating = useMemo(() => {
    if (
      chatGPTConversation.loading &&
      chatGPTConversation.writingMessage?.text
    ) {
      return true
    }
    return false
  }, [chatGPTConversation.loading, chatGPTConversation.writingMessage])
  const { stopGenerateMessage, reGenerate } = useMessageWithChatGPT()
  const handleShortCut = useCallback(
    async (key: FloatingContextMenuShortcutKey) => {
      // console.log('handleShortCut', key)
      if (key === 's') {
        needRegenerateRef.current = false
        await stopGenerateMessage()
      }
      if (key === 'r') {
        needRegenerateRef.current = true
        console.log('handleShortCut regenerate: \t [startRegenerate: true]')
        await stopGenerateMessage()
      }
    },
    [stopGenerateMessage],
  )
  const reGenerateRef = useRef(reGenerate)
  useEffect(() => {
    reGenerateRef.current = reGenerate
  }, [reGenerate])
  useEffect(() => {
    if (!isGenerating) {
      return
    }
    const keydownHandler = async (keyboardEvent: KeyboardEvent) => {
      const key = keyboardEvent.key
      if (
        isFloatingContextMenuVisible() &&
        ['r', 's', 'o', 'c'].includes(key)
      ) {
        keyboardEvent.preventDefault()
        keyboardEvent.stopPropagation()
        await handleShortCut(key as FloatingContextMenuShortcutKey)
      }
    }
    window.addEventListener('keydown', keydownHandler)
    return () => {
      window.removeEventListener('keydown', keydownHandler)
    }
  }, [isGenerating, handleShortCut])
  if (!isGenerating) {
    return <></>
  }
  return (
    <Stack
      direction={'row'}
      spacing={1}
      sx={{
        ml: 'auto!important',
        '& .usechatgpt-floating-menu__button__shortcut': {
          fontSize: '12px',
          opacity: 0.7,
          ml: '4px',
        },
      }}
    >
      {/* MARK - 暂时不需要*/}
      {/*{appState.open ? (*/}
      {/*  <Button*/}
      {/*    sx={{*/}
      {/*      height: '24px',*/}
      {/*    }}*/}
      {/*    variant="text"*/}
      {/*    onClick={async () => {*/}
      {/*      await handleShortCut('c')*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Typography*/}
      {/*      component={'span'}*/}
      {/*      fontSize={'14px'}*/}
      {/*      color={'primary.main'}*/}
      {/*    >*/}
      {/*      Close*/}
      {/*      <span className={'usechatgpt-floating-menu__button__shortcut'}>*/}
      {/*        C*/}
      {/*      </span>*/}
      {/*    </Typography>*/}
      {/*  </Button>*/}
      {/*) : (*/}
      {/*  <Button*/}
      {/*    sx={{*/}
      {/*      height: '24px',*/}
      {/*    }}*/}
      {/*    variant="text"*/}
      {/*    onClick={async () => {*/}
      {/*      await handleShortCut('o')*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Typography*/}
      {/*      component={'span'}*/}
      {/*      fontSize={'14px'}*/}
      {/*      color={'primary.main'}*/}
      {/*    >*/}
      {/*      Open*/}
      {/*      <span className={'usechatgpt-floating-menu__button__shortcut'}>*/}
      {/*        O*/}
      {/*      </span>*/}
      {/*    </Typography>*/}
      {/*  </Button>*/}
      {/*)}*/}
      <Button
        sx={{
          height: '24px',
        }}
        variant="text"
        onClick={async () => {
          await handleShortCut('r')
        }}
      >
        <Typography component={'span'} fontSize={'14px'} color={'primary.main'}>
          Try again
          <span className={'usechatgpt-floating-menu__button__shortcut'}>
            R
          </span>
        </Typography>
      </Button>
      <Button
        sx={{
          height: '24px',
        }}
        variant="text"
        onClick={async () => {
          await handleShortCut('s')
        }}
      >
        <Typography component={'span'} fontSize={'14px'} color={'primary.main'}>
          Stop
          <span className={'usechatgpt-floating-menu__button__shortcut'}>
            S
          </span>
        </Typography>
      </Button>
      <FloatingContextMenuOpenSidebarButton />
    </Stack>
  )
}
export { FloatingContextMenuShortcutButtonGroup }
