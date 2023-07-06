import React, { FC } from 'react'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { TooltipProps } from '@mui/material/Tooltip'

const FloatingContextMenuTemporaryIconButton: FC<{
  sx?: SxProps
  placement?: TooltipProps['placement']
}> = (props) => {
  const { sx, placement } = props
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
  return (
    <TextOnlyTooltip
      title={'Hide until next visit'}
      floatingMenuTooltip
      placement={placement}
    >
      <Button
        size={'small'}
        variant={'text'}
        sx={{
          width: 32,
          height: 32,
          color: 'inherit',
          minWidth: 'unset',
          ...sx,
        }}
        onClick={async () => {
          setFloatingDropdownMenu({
            open: false,
            rootRect: null,
          })
          setContextMenuSettings((prevSettings) => ({
            ...prevSettings,
            closeBeforeRefresh: true,
          }))
        }}
      >
        <ContextMenuIcon
          icon={'Close'}
          sx={{ color: 'text.primary', fontSize: 16 }}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export { FloatingContextMenuTemporaryIconButton }
