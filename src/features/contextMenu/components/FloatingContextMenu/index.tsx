import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import React, { FC, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import {
  cloneRect,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { IconButton } from '@mui/material'
import { ROOT_FLOATING_INPUT_ID } from '@/types'
import { getAppContextMenuElement } from '@/utils'
import FloatingContextMenuList, {
  useFloatingContextMenuList,
} from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
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
    middleware: [
      flip({
        fallbackPlacements: ['top-start', 'right', 'left'],
      }),
      size(),
      shift({
        crossAxis: true,
        padding: 16,
      }),
      offset((params) => {
        console.log('[ContextMenu Module]: [offset]', params)
        if (params.placement.indexOf('bottom') > -1) {
          const boundary = {
            left: 0,
            right: window.innerWidth,
            top: 0,
            bottom: window.innerHeight + window.scrollY,
          }
          if (
            isRectangleCollidingWithBoundary(
              {
                top: params.y,
                left: params.x,
                bottom: params.y + params.rects.floating.height + 50,
                right: params.rects.floating.width + params.x,
              },
              boundary,
            )
          ) {
            return (
              params.rects.reference.y -
              params.y -
              params.rects.floating.height -
              8
            )
          }
          return 8
        } else {
          return 8
        }
      }),
    ],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context, {})
  const { getFloatingProps } = useInteractions([dismiss, click])
  const [inputValue, setInputValue] = useState('')
  const haveDraft = inputValue.length > 0
  const contextMenuList = useFloatingContextMenuList(
    'contextMenus',
    defaultContextMenuJson,
    inputValue,
  )
  useEffect(() => {
    if (floatingDropdownMenu.rootRect) {
      const rect = cloneRect(floatingDropdownMenu.rootRect)
      console.log('[ContextMenu Module]: [useEffect]', rect)
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
      refs.setPositionReference({
        getBoundingClientRect() {
          return rect
        },
      })
    }
  }, [floatingDropdownMenu.rootRect])
  useEffect(() => {
    // const textarea = document.getElementById(ROOT_FLOATING_INPUT_ID)
    // debugger
    if (floatingDropdownMenu.open) {
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
          // textareaEl?.dispatchEvent(
          //   new KeyboardEvent('keydown', {
          //     key: event.key,
          //     code: event.code,
          //     shiftKey: event.shiftKey,
          //     ctrlKey: event.ctrlKey,
          //     altKey: event.altKey,
          //     metaKey: event.metaKey,
          //   }),
          // )
        }, 1)
      }
    }
  }
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
          width: floatingDropdownMenu.rootRect?.width || 'max-content',
        }}
        onKeyDown={(event) => {
          event.stopPropagation()
          // event.preventDefault()
          if (event.key.indexOf('Arrow') === -1) {
            focusInput(event as any)
          }
        }}
      >
        <FloatingContextMenuList
          menuList={contextMenuList}
          referenceElementOpen={floatingDropdownMenu.open}
          referenceElement={
            <div
              style={{
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
              <AutoHeightTextarea
                placeholder={'Ask ChatGPT to edit or generate...'}
                stopPropagation={false}
                InputId={ROOT_FLOATING_INPUT_ID}
                sx={{
                  border: 'none',
                  '& textarea': { p: 0 },
                  borderRadius: 0,
                  minHeight: '24px',
                }}
                defaultValue={''}
                onChange={(value) => {
                  setInputValue(value)
                }}
                onEnter={(value) => {
                  setInputValue('')
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
                  bgcolor: haveDraft ? 'primary.main' : 'rgb(219,219,217)',
                  '&:hover': {
                    bgcolor: haveDraft ? 'primary.main' : 'rgb(219,219,217)',
                  },
                }}
              >
                <ArrowUpwardIcon
                  sx={{
                    color: '#fff',
                    fontSize: 16,
                  }}
                />
              </IconButton>
            </div>
          }
          root={root}
        />
      </div>
    </FloatingPortal>
  )
}
export default FloatingContextMenu
