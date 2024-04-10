import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'

// import { AppState } from '@/store'
// import { hideChatBox, isShowChatBox, showChatBox } from '@/utils'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { FloatingContextMenuOpenSidebarButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuOpenSidebarButton'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'

type FloatingContextMenuShortcutKey = 's' | 'r' | 'o' | 'c'

const FloatingContextMenuShortcutButtonGroup: FC = () => {
  // const appState = useRecoilValue(AppState)
  const { clientWritingMessage } = useClientConversation()
  const needRegenerateRef = useRef(false)
  const { currentFloatingContextMenuDraft } = useFloatingContextMenuDraft()
  const isGenerating = useMemo(() => {
    if (clientWritingMessage.loading && currentFloatingContextMenuDraft) {
      return true
    }
    return false
  }, [clientWritingMessage.loading, currentFloatingContextMenuDraft])
  const { stopGenerate, regenerate } = useClientChat()
  const handleShortCut = useCallback(
    async (key: FloatingContextMenuShortcutKey) => {
      // console.log('handleShortCut', key)
      if (key === 's') {
        needRegenerateRef.current = false
        await stopGenerate()
      }
      if (key === 'r') {
        needRegenerateRef.current = true
        console.log('handleShortCut regenerate: \t [startRegenerate: true]')
        await stopGenerate()
        await reGenerateRef.current()
      }
    },
    [stopGenerate],
  )
  const reGenerateRef = useRef(regenerate)
  useEffect(() => {
    reGenerateRef.current = regenerate
  }, [regenerate])
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
