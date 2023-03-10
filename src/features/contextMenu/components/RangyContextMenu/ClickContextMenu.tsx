import { Button, Paper } from '@mui/material'
import { Menu, useContextMenu } from 'react-contexify'
import { EzMailAIIcon } from '@/components/CustomIcon'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import React, { FC, useEffect } from 'react'
import { useRangy } from '../../hooks'

import { RangyContextMenuId } from '@/features/contextMenu/components/RangyContextMenu/types'
import { flip, offset, shift, useFloating } from '@floating-ui/react'
import { getContextMenuRenderPosition } from '@/features/contextMenu/utils'
import { throttle } from 'lodash-es'

const ClickContextMenuButton: FC<{
  onClick?: (event: MouseEvent, position: { x: number; y: number }) => void
}> = (props) => {
  const { tempSelectionRanges, saveSelection, show, hideRangy } = useRangy()
  const { x, y, strategy, refs } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip({
        fallbackPlacements: ['top-start', 'right', 'left'],
      }),
      shift(),
      offset(8),
    ],
  })
  useEffect(() => {
    console.log(`[ContextMenu Module]: [button] [${show}]`)
  }, [show])
  useEffect(() => {
    const showContextMenu = () => {
      const rect = tempSelectionRanges?.selectRange?.getBoundingClientRect?.()
      if (show && rect) {
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
  }, [tempSelectionRanges, show])
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
        startIcon={<EzMailAIIcon sx={{ fontSize: 16, color: 'inherit' }} />}
        sx={{ width: 110, height: 32, color: 'inherit' }}
        size={'small'}
        onMouseUp={(event) => {
          event.stopPropagation()
          event.preventDefault()
        }}
        onClick={(event: any) => {
          if (show) {
            const saved = saveSelection()
            hideRangy()
            const savedRangeRect = saved.selectRange?.getBoundingClientRect?.()
            if (savedRangeRect && props.onClick) {
              props.onClick &&
                props.onClick(
                  event,
                  getContextMenuRenderPosition(savedRangeRect, 220, 400),
                )
            }
          }
        }}
      >
        EzMail.AI
      </Button>
    </Paper>
  )
}

const ClickContextMenu = () => {
  const { show: showContextMenu } = useContextMenu({
    id: RangyContextMenuId,
  })
  return (
    <>
      <ClickContextMenuButton
        onClick={(event: MouseEvent, position) => {
          console.log('[ContextMenu Module]: render [context menu]')
          showContextMenu({
            id: RangyContextMenuId,
            event,
            position,
          })
        }}
      />
      <Paper
        elevation={3}
        sx={{
          borderRadius: '4px',
          border: '1px solid rgb(237,237,236)',
          p: 1,
          // height: '320px',
          // overflowY: 'hidden',
        }}
      >
        <Menu
          style={{
            zIndex: 2147483601,
          }}
          id={RangyContextMenuId}
        >
          <ContextMenuList
            defaultContextMenuJson={defaultContextMenuJson}
            settingsKey={'contextMenus'}
          />
        </Menu>
      </Paper>
    </>
  )
}

export default ClickContextMenu
