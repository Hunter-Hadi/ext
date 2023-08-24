import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { showChatBox, useDebounceValue } from '@/utils'
import { useRecoilValue } from 'recoil'
import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/constants'
import { getChromeExtensionButtonContextMenu } from '@/background/utils'
import { useCurrentMessageView } from '@/features/sidebar/hooks'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks'
import cloneDeep from 'lodash-es/cloneDeep'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import { v4 as uuidV4 } from 'uuid'
import LazyLoadImage from '@/components/LazyLoadImage'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { usePermissionCard } from '@/features/auth'
import {
  CurrentInboxMessageTypeSelector,
  InboxEditState,
} from '@/features/sidebar/store/gmail'

// FIXME: inputValue采用了中介者模式，所以这个页面的代码逻辑需要重新调整
const GmailActionRunner = () => {
  const { currentMessageId } = useCurrentMessageView()
  const { step } = useRecoilValue(InboxEditState)
  const messageType = useRecoilValue(CurrentInboxMessageTypeSelector)
  const [run, setRun] = useState(false)
  const { currentUserPlan } = useUserInfo()
  const [virtualElement, setVirtualElement] = useState<DOMRect | null>(null)
  const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(null)
  const { runShortCuts, setShortCuts } = useShortCutsWithMessageChat('')
  const { showFloatingContextMenuWithVirtualElement } = useFloatingContextMenu()
  const showFloatingContextMenuRef = useRef(
    showFloatingContextMenuWithVirtualElement,
  )
  const newDraftPermissionCard = usePermissionCard('GMAIL_DRAFT_BUTTON')
  const replyPermissionCard = usePermissionCard('GMAIL_REPLY_BUTTON')
  const permissionCardMemo = useMemo(() => {
    const isDraftMessageType = messageType !== 'reply'
    return isDraftMessageType ? newDraftPermissionCard : replyPermissionCard
  }, [newDraftPermissionCard, replyPermissionCard, messageType])
  useEffect(() => {
    showFloatingContextMenuRef.current =
      showFloatingContextMenuWithVirtualElement
  }, [showFloatingContextMenuWithVirtualElement])

  useEffect(() => {
    const ctaButtonAction = (event: any) => {
      const { ctaButtonElement } = event.detail || {}
      if (currentUserPlan.name === 'free' && !currentUserPlan.isNewUser) {
        const customEvent = new CustomEvent(
          'maxAIPermissionWrapperCustomEvent',
          {
            detail: {
              id: idRef.current,
              open: false,
            },
          },
        )
        window.dispatchEvent(customEvent)
        const rect = (ctaButtonElement as HTMLElement).getBoundingClientRect()
        setVirtualElement(rect)
        setPopperAnchorEl(ctaButtonElement as HTMLElement)
        authEmitPricingHooksLog('show', permissionCardMemo.sceneType)
        return
      }
      // if (emailElement) {
      //   emailElement.focus()
      //   if (range) {
      //     const selection = window.getSelection()
      //     if (selection) {
      //       selection.removeAllRanges()
      //       selection.addRange(range)
      //     }
      //   }
      //   showFloatingContextMenuRef.current(
      //     createSelectionElement(
      //       event.detail.emailElement,
      //     ) as IVirtualIframeSelectionElement,
      //     {
      //       editableElementSelectionHTML: '',
      //       editableElementSelectionText: '',
      //       selectionText: '',
      //       selectionHTML: '',
      //     },
      //   )
      //   setRun(true)
      // }
      showChatBox()
      setRun(true)
    }
    window.addEventListener('ctaButtonClick', ctaButtonAction)
    return () => {
      window.removeEventListener('ctaButtonClick', ctaButtonAction)
    }
  }, [currentUserPlan, permissionCardMemo])

  const executeShortCuts = useCallback(async () => {
    const gmailToolBarContextMenu = await getChromeExtensionButtonContextMenu(
      'gmailButton',
    )
    const ctaButtonAction = gmailToolBarContextMenu.find((item) =>
      messageType === 'reply'
        ? item.id === USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID
        : item.id === USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
    )
    if (ctaButtonAction && ctaButtonAction?.data?.actions) {
      console.log(messageType)
      // 更新action的askChatGPT的参数
      const runActions = cloneDeep(ctaButtonAction.data.actions).map(
        (action) => {
          // HACK: 这里的写法特别蠢，但是得记录正确的api和prompt，只能这么写
          if (
            action.type === 'INSERT_USER_INPUT' ||
            action.type === 'ASK_CHATGPT' ||
            action.type === 'WEBGPT_ASK_CHATGPT'
          ) {
            if (!action.parameters.AskChatGPTActionMeta) {
              action.parameters.AskChatGPTActionMeta = {}
            }
            action.parameters.AskChatGPTActionMeta.contextMenu = ctaButtonAction
          }
          return action
        },
      )
      setShortCuts(runActions)
      await runShortCuts()
    }
  }, [setShortCuts, runShortCuts, messageType])
  const prefExecuteShortCuts = useRef(executeShortCuts)
  const prevIdRef = useRef<string | undefined>()
  useEffect(() => {
    prefExecuteShortCuts.current = executeShortCuts
  }, [executeShortCuts])
  const debounceCurrentMessageId = useDebounceValue(currentMessageId, 0)
  const memoizedDeps = useMemo(() => {
    const deps = [prefExecuteShortCuts.current, debounceCurrentMessageId, run]
    prevIdRef.current = debounceCurrentMessageId
    return deps
  }, [debounceCurrentMessageId, step, run])
  useEffect(() => {
    console.log('memoizedDeps change!', memoizedDeps)
    if (debounceCurrentMessageId && run) {
      console.log('init default input value run!')
      executeShortCuts()
      setRun(false)
    }
  }, memoizedDeps)
  const idRef = useRef(uuidV4())
  useEffect(() => {
    const listener = (event: any) => {
      if (event.detail.id === idRef.current) return
      setPopperAnchorEl(null)
      setTimeout(() => {
        setVirtualElement(null)
      }, 300)
    }
    window.addEventListener('maxAIPermissionWrapperCustomEvent', listener)
    return () => {
      window.removeEventListener('maxAIPermissionWrapperCustomEvent', listener)
    }
  }, [])
  return (
    <TextOnlyTooltip
      arrow
      placement={'top'}
      floatingMenuTooltip
      PopperProps={{
        sx: {
          '& > div': {
            p: 1,
          },
        },
      }}
      open={popperAnchorEl !== null}
      title={
        <ClickAwayListener
          onClickAway={() => {
            setPopperAnchorEl(null)
            setTimeout(() => {
              setVirtualElement(null)
            }, 300)
          }}
        >
          <Stack spacing={1} component="div">
            {permissionCardMemo.imageUrl && (
              <Box
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  '& img': {
                    width: '100%',
                    height: 'auto',
                  },
                }}
              >
                <LazyLoadImage
                  height={140}
                  src={permissionCardMemo.imageUrl}
                  alt={`${permissionCardMemo.title} img`}
                />
              </Box>
            )}
            <Typography
              fontSize={'14px'}
              fontWeight={600}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {permissionCardMemo.title}
            </Typography>
            <Typography
              fontSize={'12px'}
              fontWeight={400}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {permissionCardMemo.description}
            </Typography>
            {permissionCardMemo.ctaButtonText && (
              <Link
                target={'_blank'}
                href={permissionCardMemo.ctaButtonLink}
                onClick={(event) => {
                  permissionCardMemo.ctaButtonOnClick?.(event)
                  authEmitPricingHooksLog('click', permissionCardMemo.sceneType)
                  setPopperAnchorEl(null)
                  setTimeout(() => {
                    setVirtualElement(null)
                  }, 300)
                }}
              >
                <Button fullWidth variant={'contained'}>
                  {permissionCardMemo.ctaButtonText}
                </Button>
              </Link>
            )}
          </Stack>
        </ClickAwayListener>
      }
    >
      <Box
        sx={{
          position: 'absolute',
          top: virtualElement?.top,
          left: virtualElement?.left,
          width: virtualElement?.width,
          height: virtualElement?.height,
          zIndex: -1,
        }}
      >
        {/*⬇️⬇️⬇️只是为了渲染floating context menu的visible*/}
        <div className={'contexify'} style={{ display: 'none' }} />
      </Box>
    </TextOnlyTooltip>
  )
}
export default GmailActionRunner
