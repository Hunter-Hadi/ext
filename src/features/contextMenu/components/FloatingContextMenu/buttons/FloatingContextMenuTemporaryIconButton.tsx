import Button, { ButtonProps } from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import { TooltipProps } from '@mui/material/Tooltip'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'

const FloatingContextMenuTemporaryIconButton: FC<{
  sx?: SxProps
  placement?: TooltipProps['placement']
  ButtonProps?: Partial<ButtonProps>
  iconSize?: number
  icon?: string
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { sx, placement, ButtonProps, iconSize = 16, icon = 'Close' } = props
  const setFloatingDropdownMenu = useSetRecoilState(FloatingDropdownMenuState)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
  return (
    <TextOnlyTooltip
      title={t('client:floating_menu__button__hide_menu__until_next_visit')}
      floatingMenuTooltip
      placement={placement}
    >
      <Button
        size={'small'}
        variant={'text'}
        sx={{
          width: 32,
          height: 32,
          minWidth: 'unset',
          color: 'text.primary',
          ...sx,
        }}
        onClick={async () => {
          setFloatingDropdownMenu({
            open: false,
            rootRect: null,
            showModelSelector: false,
          })
          setContextMenuSettings((prevSettings) => ({
            ...prevSettings,
            closeBeforeRefresh: true,
          }))
        }}
        {...ButtonProps}
      >
        <ContextMenuIcon
          icon={icon}
          sx={{ color: 'inherit', fontSize: iconSize }}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export { FloatingContextMenuTemporaryIconButton }
