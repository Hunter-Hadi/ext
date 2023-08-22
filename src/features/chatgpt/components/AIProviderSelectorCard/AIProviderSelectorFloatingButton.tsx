import React, { FC, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import { SxProps } from '@mui/material/styles'
import AIProviderSelector from '@/features/chatgpt/components/AIProviderSelectorCard/index'
import Popover from '@mui/material/Popover'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { getAppRootElement } from '@/utils'
import { isMaxAINewTabPage } from '@/pages/chat/util'
import { SidebarSettingsState } from '@/features/sidebar'

const AIProviderSelectorFloatingButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { type } = useRecoilValue(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  // 用户打开之后，锁定关闭700ms
  const lockTimerRef = useRef<any>(null)
  const lockCloseRef = useRef(false)
  // 当用户手动点击了，在移开按钮之后，才能打开 popover
  const waitResetRef = useRef(false)
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (waitResetRef.current) {
      return
    }
    setAnchorEl(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  return useMemo(() => {
    if (type === 'Summary') {
      return null
    }
    return (
      <Box
        id={'max-ai__ai-provider-floating-button'}
        sx={{
          width: '44px',
          height: '44px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          border: '1px solid #EBEBEB',
          cursor: 'pointer',
          borderColor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : '#EBEBEB',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#333' : '#fff'),
          boxShadow:
            '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09);',
          ...sx,
        }}
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={(event) => {
          if (lockTimerRef.current) {
            clearTimeout(lockTimerRef.current)
          }
          lockCloseRef.current = true
          lockTimerRef.current = setTimeout(() => {
            lockCloseRef.current = false
          }, 700)
          handlePopoverOpen(event)
        }}
        onMouseLeave={() => {
          handlePopoverClose()
          waitResetRef.current = false
        }}
      >
        <AIProviderIcon
          aiProviderType={appSettings.currentAIProvider || 'USE_CHAT_GPT_PLUS'}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          id="mouse-over-popover"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              ml: isMaxAINewTabPage() ? 0 : '8px',
            },
          }}
        >
          <ClickAwayListener
            onClickAway={(event) => {
              const aiProviderCard = getAppRootElement()?.querySelector(
                '#MaxAIProviderSelectorCard',
              ) as HTMLElement
              if (aiProviderCard) {
                const rect = aiProviderCard.getBoundingClientRect()
                const x = (event as MouseEvent).clientX
                const y = (event as MouseEvent).clientY
                if (
                  x > rect.left &&
                  x < rect.right &&
                  y > rect.top &&
                  y < rect.bottom
                ) {
                  // 点击在卡片内部
                  return
                }
                handlePopoverClose()
              }
            }}
          >
            <Box
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              <AIProviderSelector
                closeAble
                onClose={() => {
                  if (lockCloseRef.current) {
                    return
                  }
                  waitResetRef.current = true
                  handlePopoverClose()
                }}
              />
            </Box>
          </ClickAwayListener>
        </Popover>
      </Box>
    )
  }, [appSettings.currentAIProvider, open, type])
}
export default AIProviderSelectorFloatingButton
