import React, { FC } from 'react'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'

const FloatingContextMenuTemporaryIconButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
  return (
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
  )
}
export { FloatingContextMenuTemporaryIconButton }
