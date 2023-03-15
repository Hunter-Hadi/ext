import { Button, Paper } from '@mui/material'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import React, { FC, useEffect } from 'react'
import { useRangy } from '@/features/contextMenu/hooks'

import { flip, offset, shift, useFloating } from '@floating-ui/react'
import {
  cloneRect,
  computedRectPosition,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import throttle from 'lodash-es/throttle'
import {
  FloatingDropdownMenuState,
  IRangyRect,
} from '@/features/contextMenu/store'
import { useSetRecoilState } from 'recoil'

const APP_NAME = process.env.APP_NAME
const APP_ENV = process.env.APP_ENV
const isProduction = process.env.NODE_ENV === 'production'
const ClickContextMenuButton: FC<{
  onClick?: (event: MouseEvent, Rect: IRangyRect) => void
}> = (props) => {
  const {
    tempSelectionRanges,
    tempSelectRangeRect,
    currentActiveWriteableElement,
    saveSelection,
    show,
    hideRangy,
  } = useRangy()
  const { x, y, strategy, refs } = useFloating({
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
    const showContextMenu = () => {
      let rect = tempSelectionRanges?.selectRange?.getBoundingClientRect?.()
      if (!rect && currentActiveWriteableElement?.getBoundingClientRect()) {
        rect = cloneRect(currentActiveWriteableElement?.getBoundingClientRect())
      }
      console.log(
        `[ContextMenu Module]: [button] [${show}]`,
        rect,
        tempSelectionRanges?.selectRange,
      )
      if (show && rect) {
        rect = computedRectPosition(rect)
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
          div.style.border = '1px solid red'
          div.style.zIndex = '9999'
          div.style.pointerEvents = 'none'
          document.body.appendChild(div)
        }
        refs.setPositionReference({
          getBoundingClientRect() {
            return {
              ...rect,
              x: rect.left,
              y: rect.top,
            }
          },
        })
      }
    }
    // scroll listen
    const scrollListener = throttle(() => {
      if (show) {
        showContextMenu()
      }
    }, 1000 / 60)
    showContextMenu()
    // 标准事件
    window.addEventListener('scroll', scrollListener, { passive: true })
    // WebKit 特定事件
    window.addEventListener('mousewheel', scrollListener, { passive: true })
    // Firefox 特定事件
    window.addEventListener('DOMMouseScroll', scrollListener, { passive: true })
    return () => {
      window.removeEventListener('scroll', scrollListener)
      window.removeEventListener('mousewheel', scrollListener)
      window.removeEventListener('DOMMouseScroll', scrollListener)
    }
  }, [tempSelectionRanges, currentActiveWriteableElement, show])
  return (
    <Paper
      elevation={3}
      component={'div'}
      ref={refs.setFloating}
      sx={{
        borderRadius: '4px',
        border: '1px solid rgb(237,237,236)',
        zIndex: show ? 2147483600 : -1,
        position: strategy,
        opacity: show ? 1 : 0,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      <Button
        variant={'text'}
        startIcon={
          APP_ENV === 'EZ_MAIL_AI' ? (
            <EzMailAIIcon sx={{ fontSize: 16, color: 'inherit' }} />
          ) : (
            <UseChatGptIcon
              sx={{
                fontSize: 16,
                color: 'inherit',
              }}
            />
          )
        }
        sx={{ width: 130, height: 32, color: 'inherit' }}
        size={'small'}
        onMouseUp={(event) => {
          event.stopPropagation()
          event.preventDefault()
        }}
        onClick={(event: any) => {
          if (show) {
            const saved = saveSelection()
            const activeElementRect =
              currentActiveWriteableElement?.getBoundingClientRect()
            hideRangy()
            const savedRangeRect = saved?.selectRange?.getBoundingClientRect?.()
            if (savedRangeRect && props.onClick) {
              props.onClick &&
                props.onClick(event, computedRectPosition(savedRangeRect))
            } else if (activeElementRect && props.onClick) {
              console.log(
                '[ContextMenu Module]: render [button] (no range)',
                activeElementRect,
                currentActiveWriteableElement,
                tempSelectRangeRect,
              )
              if (
                activeElementRect.x +
                  activeElementRect.y +
                  activeElementRect.width +
                  activeElementRect.height ===
                0
              ) {
                if (tempSelectRangeRect) {
                  props.onClick &&
                    props.onClick(
                      event,
                      computedRectPosition(cloneRect(tempSelectRangeRect)),
                    )
                }
              } else {
                props.onClick &&
                  props.onClick(
                    event,
                    computedRectPosition(cloneRect(activeElementRect)),
                  )
              }
            }
          }
        }}
      >
        {APP_NAME}
      </Button>
    </Paper>
  )
}

const ClickContextMenu = () => {
  const setFloatingDropdownMenu = useSetRecoilState(FloatingDropdownMenuState)
  return (
    <>
      <ClickContextMenuButton
        onClick={(event: MouseEvent, rect) => {
          console.log('[ContextMenu Module]: render [context menu]', rect)
          setFloatingDropdownMenu({
            open: true,
            rootRect: rect,
          })
        }}
      />
    </>
  )
}

export default ClickContextMenu
