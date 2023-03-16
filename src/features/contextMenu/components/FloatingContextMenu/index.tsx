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
import React, { FC, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import {
  cloneRect,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/features/contextMenu'
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit'
// import {
//   DropdownMenu,
//   DropdownMenuItem,
// } from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
    if (floatingDropdownMenu.open && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [floatingDropdownMenu.open])
  const [inputValue, setInputValue] = useState('')
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
      >
        <div
          style={{
            border: '1px solid rgb(237,237,236)',
            borderRadius: '6px',
            background: 'white',
            boxShadow:
              'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
            overflow: 'hidden',
            isolation: 'isolate',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: '8px',
            width: '100%',
            padding: '2px 8px',
          }}
        >
          <ContextMenuIcon
            icon={'AutoAwesome'}
            sx={{ flexShrink: 0, color: 'primary.main' }}
          />
          <AutoHeightTextarea
            sx={{ border: 'none', '& textarea': { p: 0 }, borderRadius: 0 }}
            defaultValue={''}
            onChange={setInputValue}
            onEnter={(value) => {
              setInputValue('')
            }}
          />
          <TransitEnterexitIcon
            sx={{ flexShrink: 0, color: 'text.secondary' }}
          />
          {/*<DropdownMenu root={root} label="Edit">*/}
          {/*  <DropdownMenuItem label="Undo" onClick={() => console.log('Undo')} />*/}
          {/*  <DropdownMenuItem label="Redo" disabled />*/}
          {/*  <DropdownMenuItem label="Cut" />*/}
          {/*  <DropdownMenu root={root} label="Copy as">*/}
          {/*    <DropdownMenuItem label="Text" />*/}
          {/*    <DropdownMenuItem label="Video" />*/}
          {/*    <DropdownMenu root={root} label="Image">*/}
          {/*      <DropdownMenuItem label=".png" />*/}
          {/*      <DropdownMenuItem label=".jpg" />*/}
          {/*      <DropdownMenuItem label=".svg" />*/}
          {/*      <DropdownMenuItem label=".gif" />*/}
          {/*    </DropdownMenu>*/}
          {/*    <DropdownMenuItem label="Audio" />*/}
          {/*  </DropdownMenu>*/}
          {/*  <DropdownMenu root={root} label="Share">*/}
          {/*    <DropdownMenuItem label="Mail" />*/}
          {/*    <DropdownMenuItem label="Instagram" />*/}
          {/*  </DropdownMenu>*/}
          {/*</DropdownMenu>*/}
        </div>
      </div>
    </FloatingPortal>
  )
}

export default FloatingContextMenu
