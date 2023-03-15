import {
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react'
import React, { FC, useEffect } from 'react'
import { Autocomplete, Box, Stack, TextareaAutosize } from '@mui/material'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu'
import {
  cloneRect,
  computedRectPosition,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
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
  const { x, y, strategy, refs } = useFloating({
    open: floatingDropdownMenu.open,
    onOpenChange: (open) => {
      setFloatingDropdownMenu((prev) => ({
        ...prev,
        open,
      }))
    },
    placement: 'bottom-start',
    middleware: [
      flip({
        fallbackPlacements: ['top-start', 'right', 'left'],
      }),
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
  })
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
  console.log('[ContextMenu Module]: [FloatingContextMenu]', x, y, strategy)
  return (
    <FloatingPortal root={root}>
      <Box
        ref={refs.setFloating}
        component={'div'}
        sx={{
          border: '1px solid rgb(237,237,236)',
          zIndex: floatingDropdownMenu.open ? 2147483600 : -1,
          position: strategy,
          opacity: floatingDropdownMenu.open ? 1 : 0,
          top: y ?? 0,
          left: x ?? 0,
          width: floatingDropdownMenu.rootRect?.width || 'max-content',
          borderRadius: '6px',
          background: 'white',
          boxShadow:
            'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
          overflow: 'hidden',
          isolation: 'isolate',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          '& textarea': {
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            '&:focus': {
              outline: 'none',
            },
          },
        }}
      >
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
        <Autocomplete
          onKeyDown={(event) => {
            event.stopPropagation()
          }}
          onKeyUp={(event) => {
            event.stopPropagation()
          }}
          freeSolo
          fullWidth
          placeholder={'Ask ChatGPT to edit or generate...'}
          renderInput={(params) => (
            <Stack
              direction={'row'}
              spacing={1}
              alignItems={'center'}
              sx={{
                height: 36,
                p: '2px 12px 2px 8px',
              }}
            >
              <ContextMenuIcon
                icon={'AutoAwesome'}
                sx={{ flexShrink: 0, color: 'primary.main' }}
              />
              <TextareaAutosize
                placeholder={'Ask ChatGPT to edit or generate...'}
                autoFocus
                maxRows={1}
                {...params}
              />
              <TransitEnterexitIcon
                sx={{ flexShrink: 0, color: 'text.secondary' }}
              />
            </Stack>
          )}
          options={[]}
        />
      </Box>
    </FloatingPortal>
  )
}

export default FloatingContextMenu
