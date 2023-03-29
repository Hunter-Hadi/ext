import { Box, Typography } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
const FloatingShortCutsTip: FC = () => {
  const { haveSelection, showFloatingContextMenu, floatingDropdownMenuOpen } =
    useFloatingContextMenu()
  const appSettings = useRecoilValue(AppSettingsState)
  const [buttonShow, setButtonShow] = useState(false)
  const commandKey = useMemo(() => {
    if (appSettings?.commands) {
      const command = appSettings.commands.find(
        (command) => command.name === '_execute_action',
      )
      if (command) {
        return command.shortcut || ''
      }
    }
    return ''
  }, [appSettings.commands])
  useEffect(() => {
    if (appSettings.userSettings?.selectionButtonVisible || !commandKey) {
      return
    }
    if (haveSelection) {
      setButtonShow(true)
    }
  }, [haveSelection, appSettings.userSettings, commandKey])
  useEffect(() => {
    if (buttonShow) {
      const timer = setTimeout(() => {
        setButtonShow(false)
      }, 3000)
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [buttonShow])
  useEffect(() => {
    setButtonShow(false)
  }, [floatingDropdownMenuOpen])
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: buttonShow ? 2147483661 : -1,
        backgroundColor: 'rgba(98,98,105,1)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        height: 62,
        overflow: 'hidden',
        maxWidth: buttonShow ? '100%' : 0,
        display: 'grid',
      }}
      component={'div'}
      onClick={showFloatingContextMenu}
    >
      <Typography
        fontSize={'20px'}
        fontWeight={'bold'}
        color={'#fff'}
        noWrap
        sx={{ py: 2, px: 3 }}
      >
        Press {commandKey}
      </Typography>
    </Box>
  )
}
export default FloatingShortCutsTip
