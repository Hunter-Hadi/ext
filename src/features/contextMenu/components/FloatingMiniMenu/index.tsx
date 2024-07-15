import { flip, offset, shift, useFloating } from '@floating-ui/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { useChromeExtensionButtonSettingsWithVisibility } from '@/background/utils/buttonSettings'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TooltipButton from '@/components/TooltipButton'
import { isProduction } from '@/constants'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { FloatingContextMenuMiniMenuMoreButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import { FloatingContextMenuMiniMenuSearchWithAIButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuMiniMenuSearchWithAIButton'
import FavoriteContextMenuGroup from '@/features/contextMenu/components/FloatingMiniMenu/FavoriteContextMenuGroup'
import { useRangy } from '@/features/contextMenu/hooks'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks/useFloatingContextMenu'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuLastFocusRangeState,
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { IRangyRect } from '@/features/contextMenu/types'
import {
  computedRectPosition,
  isRectangleCollidingWithBoundary,
} from '@/features/contextMenu/utils'
import { removeAllRange } from '@/features/contextMenu/utils/selectionHelper'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'
import useCommands from '@/hooks/useCommands'

const FloatingMiniMenu: FC<{
  onClick?: (event: MouseEvent, Rect: IRangyRect) => void
}> = () => {
  const { t } = useTranslation(['common', 'client'])
  const { tempSelection, show, hideRangy } = useRangy()
  const { chatBoxShortCutKey } = useCommands()
  const textSelectPopupButtonSettings =
    useChromeExtensionButtonSettingsWithVisibility('textSelectPopupButton')
  const updateSelectedId = useSetRecoilState(
    FloatingDropdownMenuSelectedItemState,
  )
  const { clientWritingMessage, updateClientConversationLoading } =
    useClientConversation()
  // 保存打开floatingMenu前最后的选区
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
  )
  const { closeBeforeRefresh } = useRecoilValue(ContextMenuSettingsState)
  const { showFloatingContextMenu } = useFloatingContextMenu()
  const [floatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [finalShow, setFinalShow] = useState(
    show &&
      textSelectPopupButtonSettings?.buttonVisible &&
      !closeBeforeRefresh &&
      !floatingDropdownMenu.open,
  )
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
    const isShow =
      show &&
      textSelectPopupButtonSettings?.buttonVisible &&
      !closeBeforeRefresh &&
      !floatingDropdownMenu.open
    setFinalShow(isShow)
    if (!tempSelection?.selectionRect || !isShow) {
      return
    }
    const rect = computedRectPosition(tempSelection.selectionRect)
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
  }, [
    show,
    textSelectPopupButtonSettings?.buttonVisible,
    closeBeforeRefresh,
    floatingDropdownMenu.open,
    tempSelection,
  ])
  const handleCloseClickContextMenuButton = () => {
    if (refs.floating.current) {
      if (getComputedStyle(refs.floating.current).opacity === '0') {
        return
      }
      hideRangy()
      removeAllRange()
    }
  }
  useEffect(() => {
    // listen doc esc
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseClickContextMenuButton()
      }
    }
    document.addEventListener('keydown', handleEsc, true)
    return () => {
      document.removeEventListener('keydown', handleEsc, true)
    }
  }, [])
  useEffect(() => {
    if (clientWritingMessage.loading) {
      setTimeout(() => {
        handleCloseClickContextMenuButton()
      }, 1000)
    }
  }, [clientWritingMessage.loading])

  return (
    <Paper
      elevation={0}
      component={'div'}
      ref={refs.setFloating}
      className={`max-ai__click-context-menu ${finalShow ? 'open' : 'close'}`}
      sx={{
        bgcolor: 'transparent',
        zIndex: finalShow ? 2147483600 : -1,
        position: strategy,
        opacity: finalShow ? 1 : 0,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          '&:hover': {
            '.mini-icon-button': {
              visibility: 'hidden',
              userSelect: 'none',
              zIndex: -1,
            },
          },
        }}
      >
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{
            opacity: 0,
            borderRadius: '14px',
            // overflow: 'hidden',
            transition: 'opacity 0.1s ease-in-out',
            '&:hover': {
              opacity: 1,
              boxShadow:
                '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
            },
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
              title={t('client:floating_menu__button__cta__tooltip')}
              className={'usechatgpt-ai__context-menu--handle-button'}
              id={'max_ai__floating_context_menu__cta_button'}
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
                const selectionCount = window.getSelection()?.rangeCount
                if (selectionCount && selectionCount > 0) {
                  const lastFocusRange = window
                    .getSelection()
                    ?.getRangeAt(0)
                    ?.cloneRange()
                  setFloatingDropdownMenuLastFocusRange({
                    range: lastFocusRange || null,
                    selectionText: window?.getSelection()?.toString() || '',
                  })
                }
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
          <FloatingContextMenuMiniMenuSearchWithAIButton
            placement={placement}
            selectionText={tempSelection?.selectionText}
          />
          <FavoriteContextMenuGroup
            placement={placement}
            buttonSettingKey={'textSelectPopupButton'}
            onClick={(favoriteContextMenu) => {
              updateClientConversationLoading(true)
              updateSelectedId((prevState) => {
                return {
                  ...prevState,
                  selectedContextMenuId: favoriteContextMenu.id,
                }
              })
              tempSelection && showFloatingContextMenu()
            }}
          />
          <FloatingContextMenuMiniMenuMoreButton placement={placement} />
        </Stack>
        <Stack
          className={'mini-icon-button'}
          sx={{
            top: 2,
            left: 2,
            position: 'absolute',
            bgcolor: 'background.paper',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
          }}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Button
            sx={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              minWidth: 'unset',
              display: 'flex',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0px 0px 1px 0px rgba(255, 255, 255, 0.60), 0px 2px 4px 0px rgba(255, 255, 255, 0.08);'
                  : '0px 0px 1px 0px rgba(0, 0, 0, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.08);',
              color: 'primary.main',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <UseChatGptIcon
              sx={{
                fontSize: '10px',
                marginRight: '1px',
                // color: 'inherit',
              }}
            />
            {/*<SvgIcon*/}
            {/*  sx={{*/}
            {/*    fontSize: '12px',*/}
            {/*    color: 'inherit',*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <svg*/}
            {/*    width='24'*/}
            {/*    height='24'*/}
            {/*    viewBox='0 0 24 24'*/}
            {/*    fill='none'*/}
            {/*    xmlns='http://www.w3.org/2000/svg'*/}
            {/*  >*/}
            {/*    <g mask='url(#mask0_1083_221650)'>*/}
            {/*      <path*/}
            {/*        d='M8.875 15.125L12 22L15.125 15.125L22 12L15.125 8.875L12 2L8.875 8.875L2 12L8.875 15.125Z'*/}
            {/*        fill='currentColor'*/}
            {/*      />*/}
            {/*    </g>*/}
            {/*  </svg>*/}
            {/*</SvgIcon>*/}
          </Button>
        </Stack>
      </Box>
      <OnboardingTooltipPortal
        showStateTrigger={show}
        sceneType='CONTEXT_MENU_CTA_MINI_ICON_BUTTON'
      />
    </Paper>
  )
}

export default FloatingMiniMenu
