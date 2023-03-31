import { Box, Typography } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import { ROOT_CONTAINER_ID } from '@/types'
const FloatingShortCutsTip: FC = () => {
  const { haveSelection, showFloatingContextMenu, floatingDropdownMenuOpen } =
    useFloatingContextMenu()
  const appSettings = useRecoilValue(AppSettingsState)
  const [chatBoxWidth, setChatBoxWidth] = useState(16)
  const [buttonShow, setButtonShow] = useState(3)
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
      const appRootElement = document.querySelector(`#${ROOT_CONTAINER_ID}`)
      if (appRootElement && appRootElement.classList.contains('open')) {
        setChatBoxWidth(
          (appRootElement.getBoundingClientRect().width || 0) + 16,
        )
      } else {
        setChatBoxWidth(16)
      }
      setButtonShow(1)
    }
  }, [haveSelection, appSettings.userSettings, commandKey])
  useEffect(() => {
    if (buttonShow === 1) {
      setButtonShow(2)
    } else if (buttonShow === 2) {
      const timer = setTimeout(() => {
        setButtonShow(3)
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [buttonShow])
  useEffect(() => {
    setButtonShow(3)
  }, [floatingDropdownMenuOpen])
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: chatBoxWidth,
        zIndex: buttonShow !== 3 ? 2147483661 : -1,
        backgroundColor: 'rgba(98,98,105,1)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        maxWidth: buttonShow !== 3 ? '100%' : 0,
        display: 'grid',
      }}
      component={'div'}
      onClick={showFloatingContextMenu}
    >
      <Typography
        fontSize={'24px'}
        fontWeight={'bold'}
        color={'#fff'}
        noWrap
        sx={{ px: '10px', py: '4px' }}
      >
        {commandKey}
      </Typography>
    </Box>
  )
}
export default FloatingShortCutsTip
