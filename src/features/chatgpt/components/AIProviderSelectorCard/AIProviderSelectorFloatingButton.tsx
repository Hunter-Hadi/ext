import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popover from '@mui/material/Popover'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo, useRef } from 'react'

import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import AIProviderSelector from '@/features/chatgpt/components/AIProviderSelectorCard/index'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const AIProviderSelectorFloatingButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { currentSidebarConversationType } = useSidebarSettings()
  const {
    aiProvider = 'USE_CHAT_GPT_PLUS',
    aiProviderModel,
  } = useAIProviderModels()
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
    if (currentSidebarConversationType !== 'Chat') {
      return null
    }
    return (
      <Box
        id={'max-ai__ai-provider-floating-button'}
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 2,
          cursor: 'pointer',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3B3D3E' : '#E9E9EB'),
          // boxShadow:
          //   '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09);',
          p: 0.5,
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
        <AIProviderIcon aiProviderType={aiProvider} />
        <Typography
          ml={0.5}
          fontSize={14}
          lineHeight={1.4}
          color="text.secondary"
          sx={{
            userSelect: 'none',
          }}
        >
          {aiProviderModel}
        </Typography>
        <Popover
          open={open}
          anchorEl={anchorEl}
          id="mouse-over-popover"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          disableScrollLock
          PaperProps={{
            sx: {
              ml: 0,
            },
          }}
        >
          <ClickAwayListener
            onClickAway={(event) => {
              const aiProviderCard = getMaxAISidebarRootElement()?.querySelector(
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
  }, [aiProvider, open, currentSidebarConversationType])
}
export default AIProviderSelectorFloatingButton
