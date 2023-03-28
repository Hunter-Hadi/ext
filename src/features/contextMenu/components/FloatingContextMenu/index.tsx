import {
  autoUpdate,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import {
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/store'
import {
  cloneRect,
  FloatingContextMenuMiddleware,
} from '@/features/contextMenu/utils'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { CircularProgress, IconButton, Stack, Typography } from '@mui/material'
import { ROOT_FLOATING_INPUT_ID } from '@/types'
import { getAppContextMenuElement, showChatBox } from '@/utils'
import { useContextMenuList } from '@/features/contextMenu/hooks/useContextMenuList'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'

const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []
const isProduction = process.env.NODE_ENV === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const { x, y, strategy, refs, context } = useFloating({
    open: floatingDropdownMenu.open,
    onOpenChange: (open) => {
      setFloatingDropdownMenu((prev) => {
        return {
          ...prev,
          open,
        }
      })
    },
    placement: 'bottom-start',
    middleware: FloatingContextMenuMiddleware,
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context, {})
  const { getFloatingProps } = useInteractions([dismiss, click])
  useEffect(() => {
    if (floatingDropdownMenu.rootRect) {
      const rect = cloneRect(floatingDropdownMenu.rootRect)
      console.log('[ContextMenu Module]: [useEffect]', rect)
      if (!isProduction) {
        // render rect
        document.querySelector('#rangeBorderBox')?.remove()
        const div = document.createElement('div')
        div.id = 'rangeBorderBox'
        div.style.position = 'absolute'
        div.style.left = rect.left + 'px'
        div.style.top = rect.top + window.scrollY + 'px'
        div.style.width = rect.width + 'px'
        div.style.height = rect.height + 'px'
        div.style.border = '1px solid green'
        div.style.zIndex = '9999'
        div.style.pointerEvents = 'none'
        document.body.appendChild(div)
      }
      refs.setPositionReference({
        getBoundingClientRect() {
          return rect
        },
      })
    }
  }, [floatingDropdownMenu.rootRect])
  const [inputValue, setInputValue] = useState('')
  const { setShortCuts, runShortCuts, loading } =
    useShortCutsWithMessageChat('')
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'contextMenus',
    defaultContextMenuJson,
    inputValue,
  )
  const haveDraft = inputValue.length > 0
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      setInputValue('')
      const textareaEl = getAppContextMenuElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
    }
  }, [floatingDropdownMenu.open])
  const focusInput = (event: KeyboardEvent) => {
    if (floatingDropdownMenu.open) {
      const textareaEl = getAppContextMenuElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        textareaEl?.focus()
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
    }
  }
  useEffect(() => {
    /**
     * @description
     * 1. 必须有选中的id
     * 2. 必须有子菜单
     * 3. contextMenu必须是打开状态
     * 4. 必须不是loading
     */
    if (
      floatingDropdownMenuSelectedItem.selectedContextMenuId &&
      originContextMenuList.length > 0 &&
      floatingDropdownMenu.open &&
      !loading
    ) {
      const findContextMenu = originContextMenuList.find(
        (contextMenu) =>
          contextMenu.id ===
          floatingDropdownMenuSelectedItem.selectedContextMenuId,
      )
      if (
        findContextMenu &&
        findContextMenu.data.actions &&
        findContextMenu.data.actions.length > 0
      ) {
        setFloatingDropdownMenu({
          open: false,
          rootRect: null,
        })
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
            lastHoverContextMenuId: null,
          }
        })
        setShortCuts(findContextMenu.data.actions)
        runShortCuts().then(() => {
          setFloatingDropdownMenu((prevState) => {
            return {
              ...prevState,
              running: false,
            }
          })
        })
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    originContextMenuList,
    floatingDropdownMenu.open,
    loading,
  ])
  const currentWidth = useMemo(() => {
    if (floatingDropdownMenu.rootRect) {
      const minWidth = Math.max(floatingDropdownMenu.rootRect?.width || 0, 680)
      if (minWidth > 1280) {
        return 1280
      }
      return minWidth
    }
    return 680
  }, [floatingDropdownMenu.rootRect])
  return (
    <FloatingPortal root={root}>
      <div
        ref={refs.setFloating}
        {...getFloatingProps()}
        style={{
          position: strategy,
          zIndex: floatingDropdownMenu.open ? 2147483601 : -1,
          opacity: floatingDropdownMenu.open ? 1 : 0,
          top: y ?? 0,
          left: x ?? 0,
          width: currentWidth,
          maxWidth: '90%',
        }}
        onKeyDown={(event) => {
          event.stopPropagation()
          // event.preventDefault()
          if (event.key.indexOf('Arrow') === -1) {
            focusInput(event as any)
          }
          if (event.key === 'Escape') {
            setFloatingDropdownMenu({
              open: false,
              rootRect: null,
            })
          }
          console.log(event.key)
        }}
      >
        <FloatingContextMenuList
          needAutoUpdate
          menuList={loading ? EMPTY_ARRAY : contextMenuList}
          referenceElementOpen={floatingDropdownMenu.open}
          referenceElement={
            <div
              style={{
                boxSizing: 'border-box',
                border: '1px solid rgb(237,237,236)',
                background: 'white',
                borderRadius: '6px',
                boxShadow:
                  'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
                overflow: 'hidden',
                isolation: 'isolate',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                gap: '8px',
                width: '100%',
                padding: '7px 8px',
              }}
            >
              <ContextMenuIcon
                icon={'AutoAwesome'}
                sx={{
                  flexShrink: 0,
                  color: 'primary.main',
                  height: '24px',
                  alignSelf: 'start',
                }}
              />
              <Stack
                direction={'row'}
                width={0}
                flex={1}
                alignItems={'center'}
                spacing={1}
                justifyContent={'left'}
              >
                {loading ? (
                  <>
                    <Typography fontSize={'16px'} color={'primary.main'}>
                      AI is writing...
                    </Typography>
                    <CircularProgress size={'16px'} />
                  </>
                ) : (
                  <>
                    <AutoHeightTextarea
                      placeholder={'Use ChatGPT to edit or generate...'}
                      stopPropagation={false}
                      InputId={ROOT_FLOATING_INPUT_ID}
                      sx={{
                        border: 'none',
                        '& textarea': { p: 0 },
                        borderRadius: 0,
                        minHeight: '24px',
                      }}
                      defaultValue={inputValue}
                      onChange={(value) => {
                        setInputValue(value)
                      }}
                      onEnter={(value) => {
                        if (!haveDraft) return
                        showChatBox()
                        setFloatingDropdownMenu({
                          open: false,
                          rootRect: null,
                        })
                        updateFloatingDropdownMenuSelectedItem(() => {
                          return {
                            lastHoverContextMenuId: null,
                            selectedContextMenuId: null,
                            hoverContextMenuIdMap: {},
                          }
                        })
                        setTimeout(async () => {
                          setInputValue('')
                          setShortCuts([
                            {
                              type: 'RENDER_CHATGPT_PROMPT',
                              parameters: {
                                template: `${value}:\n\n{{HIGHLIGHTED_TEXT}}`,
                              },
                            },
                            {
                              type: 'ASK_CHATGPT',
                              parameters: {},
                            },
                          ])
                          await runShortCuts()
                        }, 1)
                      }}
                    />
                    <IconButton
                      sx={{
                        height: '20px',
                        width: '20px',
                        flexShrink: 0,
                        alignSelf: 'end',
                        alignItems: 'center',
                        p: 0,
                        m: '2px',
                        cursor: haveDraft ? 'pointer' : 'default',
                        bgcolor: haveDraft
                          ? 'primary.main'
                          : 'rgb(219,219,217)',
                        '&:hover': {
                          bgcolor: haveDraft
                            ? 'primary.main'
                            : 'rgb(219,219,217)',
                        },
                      }}
                      onClick={() => {
                        if (!haveDraft) return
                        showChatBox()
                        setFloatingDropdownMenu({
                          open: false,
                          rootRect: null,
                        })
                        updateFloatingDropdownMenuSelectedItem(() => {
                          return {
                            lastHoverContextMenuId: null,
                            selectedContextMenuId: null,
                            hoverContextMenuIdMap: {},
                          }
                        })
                        setTimeout(async () => {
                          setInputValue('')
                          setShortCuts([
                            {
                              type: 'RENDER_CHATGPT_PROMPT',
                              parameters: {
                                template: `${inputValue}:\n """\n{{HIGHLIGHTED_TEXT}}\n"""`,
                              },
                            },
                            {
                              type: 'ASK_CHATGPT',
                              parameters: {},
                            },
                          ])
                          await runShortCuts()
                        }, 1)
                      }}
                    >
                      <ArrowUpwardIcon
                        sx={{
                          color: '#fff',
                          fontSize: 16,
                        }}
                      />
                    </IconButton>
                  </>
                )}
              </Stack>
            </div>
          }
          customOpen
          root={root}
        />
      </div>
    </FloatingPortal>
  )
}
export { FloatingContextMenu }
