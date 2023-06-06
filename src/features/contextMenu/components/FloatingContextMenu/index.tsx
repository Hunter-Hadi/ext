import {
  autoUpdate,
  FloatingPortal,
  Placement,
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
  getContextMenuRenderPosition,
} from '@/features/contextMenu/utils'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  ROOT_FLOATING_INPUT_ID,
} from '@/types'
import { getAppContextMenuElement, showChatBox } from '@/utils'
import { useContextMenuList } from '@/features/contextMenu/hooks/useContextMenuList'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useTheme } from '@mui/material/styles'
import { FloatingContextMenuCloseIconButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import { getMediator } from '@/store/mediator'

const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []
const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const { palette } = useTheme()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const currentWidth = useMemo(() => {
    if (floatingDropdownMenu.rootRect) {
      const minWidth = Math.max(
        floatingDropdownMenu.rootRect?.width || 0,
        CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH - 32,
      )
      if (minWidth > 1280) {
        return 1280
      }
      return minWidth
    }
    return CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH - 32
  }, [floatingDropdownMenu.rootRect])
  const safePlacement = useMemo(() => {
    // 为了防止input+contextMenu出现遮挡了原本选中的字体，所以这里的方向其实要算input+contextMenu的高度
    // 1. 基于高亮块矩形计算出实际渲染input矩形的初始点xy位置
    // 2. 基于高亮块和input的y值判断input的渲染方向和contextMenu的渲染方向
    let inputPlacement: Placement = 'bottom-start'
    let contextMenuPlacement: Placement = 'bottom-start'
    if (floatingDropdownMenu.rootRect && currentWidth) {
      const position = getContextMenuRenderPosition(
        floatingDropdownMenu.rootRect,
        currentWidth,
        400,
      )
      console.log(
        '[ContextMenu Module]: [safePlacement]',
        position.x,
        floatingDropdownMenu.rootRect.left,
        '\n',
        position.y,
        floatingDropdownMenu.rootRect.y,
      )
      // 先看渲染在上方还是下方
      if (position.y > floatingDropdownMenu.rootRect.top) {
        // 说明渲染在下方
        inputPlacement = 'bottom-start'
        contextMenuPlacement = 'bottom-start'
      } else if (position.y < floatingDropdownMenu.rootRect.top) {
        inputPlacement = 'top-start'
        contextMenuPlacement = 'top-start'
      }
      // 再看渲染在左方还是右方
      if (position.x > floatingDropdownMenu.rootRect.left + 300) {
        // 说明渲染在右方 300是因为input宽度至少为450
        inputPlacement = 'right-start'
      } else if (position.x < floatingDropdownMenu.rootRect.left - 300) {
        // 说明渲染在左方 300是因为input宽度至少为450
        inputPlacement = 'left-start'
      }
    }
    return {
      inputPlacement,
      contextMenuPlacement,
    }
  }, [floatingDropdownMenu.rootRect, currentWidth])
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
    placement: safePlacement.inputPlacement,
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
    inputValue,
  )

  useEffect(() => {
    if (contextMenuList.length > 0) {
      let firstMenuItem: null | IContextMenuItemWithChildren = null
      contextMenuList.find((menuItem) => {
        if (menuItem.data.type === 'group') {
          if (menuItem.children.length > 0) {
            firstMenuItem =
              menuItem.children.find(
                (child) => child.data.type === 'shortcuts',
              ) || null
            return firstMenuItem !== null
          }
        } else if (menuItem.data.type === 'shortcuts') {
          firstMenuItem = menuItem
          return true
        }
        return false
      })
      if (firstMenuItem) {
        updateFloatingDropdownMenuSelectedItem((prev) => {
          return {
            ...prev,
            lastHoverContextMenuId: firstMenuItem?.id || '',
          }
        })
      }
    }
  }, [contextMenuList])

  const haveDraft = inputValue.length > 0
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      getMediator('floatingMenuInputMediator').updateInputValue('')
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
  useEffect(() => {
    getMediator('floatingMenuInputMediator').subscribe(setInputValue)
    return () => {
      getMediator('floatingMenuInputMediator').unsubscribe(setInputValue)
    }
  }, [])
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
          maxWidth: '90vw',
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
          defaultPlacement={safePlacement.contextMenuPlacement}
          needAutoUpdate
          menuList={loading ? EMPTY_ARRAY : contextMenuList}
          referenceElementOpen={floatingDropdownMenu.open}
          referenceElement={
            <div
              style={{
                boxSizing: 'border-box',
                border: '1px solid',
                borderColor: palette.customColor.borderColor,
                background: palette.customColor.paperBackground,
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
              onKeyPress={(event) => {
                event.stopPropagation()
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
                      placeholder={'Ask AI to edit or generate...'}
                      stopPropagation={false}
                      InputId={ROOT_FLOATING_INPUT_ID}
                      sx={{
                        border: 'none',
                        '& textarea': { p: 0 },
                        borderRadius: 0,
                        minHeight: '24px',
                      }}
                      onEnter={(value) => {
                        showChatBox()
                        if (contextMenuList.length > 0) {
                          updateFloatingDropdownMenuSelectedItem((preState) => {
                            return {
                              ...preState,
                              selectedContextMenuId:
                                preState.lastHoverContextMenuId,
                            }
                          })
                          return
                        }
                        if (!haveDraft) return
                        // showChatBox()
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
                          setShortCuts([
                            {
                              type: 'RENDER_CHATGPT_PROMPT',
                              parameters: {
                                template: `${value}:\n\n{{SELECTED_TEXT}}`,
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
                        position: 'relative',
                        top: '-1px',
                        flexShrink: 0,
                        alignSelf: 'end',
                        alignItems: 'center',
                        p: 0,
                        m: '4px',
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
                        showChatBox()
                        if (contextMenuList.length > 0) {
                          updateFloatingDropdownMenuSelectedItem((preState) => {
                            return {
                              ...preState,
                              selectedContextMenuId:
                                preState.lastHoverContextMenuId,
                            }
                          })
                          return
                        }
                        if (!haveDraft) return
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
                          setShortCuts([
                            {
                              type: 'RENDER_CHATGPT_PROMPT',
                              parameters: {
                                template: `${inputValue}:\n """\n{{SELECTED_TEXT}}\n"""`,
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
                    <FloatingContextMenuCloseIconButton
                      useInButton={false}
                      sx={{ width: 24, height: 24, alignSelf: 'end' }}
                    />
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
