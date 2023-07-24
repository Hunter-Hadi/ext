import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { UseChatGptIcon } from '@/components/CustomIcon'
import React, { FC, useEffect, useMemo } from 'react'
import { useRangy } from '@/features/contextMenu/hooks'

import { flip, offset, shift, useFloating } from '@floating-ui/react'
import {
  cloneRect,
  computedRectPosition,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks/useFloatingContextMenu'
import { FloatingContextMenuMiniMenuMoreButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import useCommands from '@/hooks/useCommands'
import { isProduction } from '@/constants'
import { useComputedChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import { IRangyRect } from '@/features/contextMenu/types'
import TooltipButton from '@/components/TooltipButton'
import FavoriteContextMenuGroup from '@/features/contextMenu/components/FavoriteContextMenuGroup'
import Box from '@mui/material/Box'

const ClickContextMenuButton: FC<{
  onClick?: (event: MouseEvent, Rect: IRangyRect) => void
}> = (props) => {
  const { tempSelection, show } = useRangy()
  const { chatBoxShortCutKey } = useCommands()
  const textSelectPopupButtonSettings =
    useComputedChromeExtensionButtonSettings('textSelectPopupButton')
  const updateSelectedId = useSetRecoilState(
    FloatingDropdownMenuSelectedItemState,
  )
  const { closeBeforeRefresh } = useRecoilValue(ContextMenuSettingsState)
  const { showFloatingContextMenu } = useFloatingContextMenu()
  const [floatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const memoShow = useMemo(() => {
    console.log(
      show,
      textSelectPopupButtonSettings?.buttonVisible,
      'textSelectPopupButtonSettings',
    )
    return (
      show &&
      textSelectPopupButtonSettings?.buttonVisible &&
      !closeBeforeRefresh &&
      !floatingDropdownMenu.open
    )
  }, [
    closeBeforeRefresh,
    show,
    textSelectPopupButtonSettings,
    floatingDropdownMenu,
  ])
  const { x, y, strategy, refs, placement } = useFloating({
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
    if (!tempSelection || !memoShow) {
      return
    }
    let rect = cloneRect(tempSelection.selectionRect)
    console.log(
      `[ContextMenu Module]: [button] [${memoShow}]`,
      tempSelection.selectionRect,
    )
    if (memoShow && rect) {
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
        div.style.border = '2px solid red'
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
  }, [tempSelection, memoShow])
  return (
    <Paper
      elevation={3}
      component={'div'}
      ref={refs.setFloating}
      sx={{
        bgcolor: 'transparent',
        borderRadius: '14px',
        zIndex: memoShow ? 2147483600 : -1,
        position: strategy,
        opacity: memoShow ? 1 : 0,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        sx={{
          '& .max-ai__click-menu-button--box': {
            div: {
              display: 'flex',
            },
            height: '28px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              '&:has(button)&::after': {
                display: 'none',
              },
            },
            '& button': {
              bgcolor: 'background.paper',
              minWidth: 'unset',
              padding: '5px 8px!important',
              boxSizing: 'border-box',
              borderRadius: '0',
              '&:hover': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgb(61,61,61)'
                    : 'rgb(224,224,224)',
              },
              '&:has(.max-ai__click-menu-button--box__text-icon)': {
                padding: '3px 6px!important',
              },
            },
            '&:first-child': {
              '& button': {
                borderTopLeftRadius: '14px',
                borderBottomLeftRadius: '14px',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              },
            },
            '&:not(:last-child)': {
              '&::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: '25%',
                transform: 'scale(0.5) translateY(-50%)',
                width: '1px',
                height: '32px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgb(61,61,61)'
                    : 'rgb(224,224,224)',
              },
            },
          },
        }}
      >
        <Box component={'div'} className={'max-ai__click-menu-button--box'}>
          <TooltipButton
            TooltipProps={{
              floatingMenuTooltip: true,
              placement,
              description: chatBoxShortCutKey,
              sx: {
                maxWidth: 360,
              },
            }}
            title={'Ask AI to edit, summarize, explain, or generate text'}
            className={'usechatgpt-ai__context-menu--handle-button'}
            size={'small'}
            variant={'text'}
            onMouseUp={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onMouseDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onClick={(event: any) => {
              event.stopPropagation()
              event.preventDefault()
              tempSelection && showFloatingContextMenu()
            }}
          >
            <UseChatGptIcon
              sx={{
                fontSize: '18px',
                // color: 'inherit',
              }}
            />
          </TooltipButton>
        </Box>
        <FavoriteContextMenuGroup
          placement={placement}
          buttonSettingKey={'textSelectPopupButton'}
          onClick={(favoriteContextMenu) => {
            tempSelection && showFloatingContextMenu()
            setTimeout(() => {
              updateSelectedId((prevState) => {
                return {
                  ...prevState,
                  selectedContextMenuId: favoriteContextMenu.id,
                }
              })
            }, 100)
          }}
        />
        <FloatingContextMenuMiniMenuMoreButton placement={placement} />
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
