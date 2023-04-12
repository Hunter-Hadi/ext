import { Button, Paper, Stack, Typography } from '@mui/material'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import React, { FC, useEffect } from 'react'
import { useRangy } from '@/features/contextMenu/hooks'

import { flip, offset, shift, useFloating } from '@floating-ui/react'
import {
  cloneRect,
  computedRectPosition,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import { IRangyRect } from '@/features/contextMenu/store'
import { useRecoilValue } from 'recoil'
import { FloatingContextMenuMoreIconButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuMoreIconButton'
import { AppSettingsState } from '@/store'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks/useFloatingContextMenu'
import useCommands from '@/hooks/useCommands'

const APP_NAME = process.env.APP_NAME
const APP_ENV = process.env.APP_ENV
const isProduction = process.env.NODE_ENV === 'production'
const ClickContextMenuButton: FC<{
  onClick?: (event: MouseEvent, Rect: IRangyRect) => void
}> = (props) => {
  const { tempSelection, show } = useRangy()
  const appSettings = useRecoilValue(AppSettingsState)
  const { shortCutKey } = useCommands()
  const { showFloatingContextMenu } = useFloatingContextMenu()
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
    if (!tempSelection || !show) {
      return
    }
    let rect = cloneRect(tempSelection.selectionRect)
    console.log(
      `[ContextMenu Module]: [button] [${show}]`,
      tempSelection.selectionRect,
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
  }, [tempSelection, show])
  return (
    <Paper
      elevation={3}
      component={'div'}
      ref={refs.setFloating}
      sx={{
        borderRadius: '4px',
        border: '1px solid',
        borderColor: 'customColor.borderColor',
        zIndex:
          show && appSettings.userSettings?.selectionButtonVisible
            ? 2147483600
            : -1,
        position: strategy,
        opacity:
          show && appSettings.userSettings?.selectionButtonVisible ? 1 : 0,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      <Stack direction={'row'} alignItems={'center'}>
        <Button
          size={'small'}
          variant={'text'}
          sx={{
            px: '8px!important',
            height: 32,
            color: 'inherit',
            marginRight: '1px',
            borderRadius: '4px 0 0 4px',
            boxShadow: 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
            '&:hover': {
              boxShadow: 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
            },
          }}
          onMouseUp={(event) => {
            event.stopPropagation()
            event.preventDefault()
          }}
          onClick={(event: any) => {
            tempSelection && showFloatingContextMenu()
          }}
        >
          {APP_ENV === 'EZ_MAIL_AI' ? (
            <EzMailAIIcon
              sx={{
                pr: 0.5,
                fontSize: 16,
                // color: 'inherit',
              }}
            />
          ) : (
            <UseChatGptIcon
              sx={{
                pr: 1,
                fontSize: 16,
                // color: 'inherit',
              }}
            />
          )}
          {APP_NAME === 'EzMail.AI' ? 'EzMail.AI' : 'Use ChatGPT'}
          {shortCutKey && (
            <Typography
              component={'span'}
              sx={{
                color: (t) =>
                  t.palette.mode === 'dark' ? '#999' : 'rgba(55, 53, 47, 0.5)',
                fontSize: '12px',
                pl: 1,
              }}
            >
              {shortCutKey}
            </Typography>
          )}
        </Button>
        <FloatingContextMenuMoreIconButton />
      </Stack>
    </Paper>
  )
}

const ClickContextMenu = () => {
  return (
    <>
      <ClickContextMenuButton />
    </>
  )
}

export default ClickContextMenu
