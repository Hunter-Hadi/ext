import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import React, { FC, useEffect, useState } from 'react'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks'
import { useRecoilValue } from 'recoil'
import { ROOT_CONTAINER_ID } from '@/constants'
import useCommands from '@/hooks/useCommands'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { ContextMenuSettingsState } from '@/features/contextMenu/store'
import { useComputedChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
const FloatingShortCutsTip: FC = () => {
  const { closeBeforeRefresh } = useRecoilValue(ContextMenuSettingsState)
  const { haveSelection, showFloatingContextMenu, floatingDropdownMenuOpen } =
    useFloatingContextMenu()
  const textSelectPopupButtonSettings =
    useComputedChromeExtensionButtonSettings('textSelectPopupButton')
  const [chatBoxWidth, setChatBoxWidth] = useState(16)
  const [buttonShow, setButtonShow] = useState(3)
  const { shortCutKey } = useCommands()
  useEffect(() => {
    if (textSelectPopupButtonSettings?.buttonVisible && !closeBeforeRefresh) {
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
  }, [haveSelection, textSelectPopupButtonSettings, closeBeforeRefresh])
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
    <>
      {shortCutKey ? (
        <Box
          className={'usechatgpt-ai__context-menu--handle-button'}
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
            {shortCutKey}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: chatBoxWidth,
            zIndex: buttonShow !== 3 ? 2147483661 : -1,
            backgroundColor: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            maxWidth: buttonShow !== 3 ? '100%' : 0,
            display: 'grid',
          }}
          component={'div'}
          onClick={showFloatingContextMenu}
        >
          <Paper elevation={3} sx={{ padding: '8px 10px' }}>
            <UseChatGptIcon sx={{ fontSize: 24 }} />
          </Paper>
        </Box>
      )}
    </>
  )
}
export default FloatingShortCutsTip
