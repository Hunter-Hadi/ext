import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { TooltipProps } from '@mui/material/Tooltip'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipButton from '@/components/TooltipButton'
import { useRangy } from '@/features/contextMenu'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const FloatingContextMenuMiniMenuSearchWithAIButton: FC<{
  placement?: TooltipProps['placement']
  TooltipProps?: TooltipProps
  sx?: SxProps
}> = (props) => {
  const { sx, placement, TooltipProps } = props
  const { t } = useTranslation(['common', 'client'])
  const { hideRangy } = useRangy()
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      className={'max-ai__click-menu-button--box'}
      sx={{
        '&.max-ai__click-menu-button--box': {
          '& button': {
            padding: '5px 5px!important',
            '&:has(.max-ai__click-menu-button--box__text-icon)': {
              padding: '3px 3px!important',
            },
          },
        },
        ...sx,
      }}
    >
      <TooltipButton
        TooltipProps={{
          floatingMenuTooltip: true,
          placement: placement || 'bottom',
          ...TooltipProps,
        }}
        title={t('client:sidebar__tabs__search__tooltip')}
        sx={{
          minWidth: 'unset',
          p: '8px!important',
        }}
        onMouseUp={(event) => {
          event.stopPropagation()
          event.preventDefault()
        }}
        onMouseDown={(event) => {
          event.stopPropagation()
          event.preventDefault()
        }}
        onClick={async (event) => {
          event.stopPropagation()
          event.preventDefault()
          const question = window.getSelection()?.toString()
          hideRangy()
          showChatBox()
          for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            if (isShowChatBox()) {
              break
            }
          }
          if (question) {
            await OneShotCommunicator.send('QuickSearchSelectedText', {
              question,
              includeHistory: false,
            })
          }
        }}
      >
        <ContextMenuIcon
          icon={'Search'}
          sx={{
            fontSize: '18px',
            color: (t: any) =>
              t.palette.mode === 'dark'
                ? 'rgba(255,255,255,.87)'
                : 'rgba(0,0,0,.6)',
          }}
        />
      </TooltipButton>
    </Stack>
  )
}
export { FloatingContextMenuMiniMenuSearchWithAIButton }
