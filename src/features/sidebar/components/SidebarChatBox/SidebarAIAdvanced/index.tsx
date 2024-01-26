import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useRef } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import ArtAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/ArtAdvanced'
import ChatAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/ChatAdvanced'
import SearchAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/SearchAdvanced'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

/**
 * AI设置
 * @constructor
 */
const SearchWithAIAdvanced: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { currentSidebarConversationType } = useSidebarSettings()
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

  if (currentSidebarConversationType === 'Summary') {
    return null
  }

  return (
    <Box
      id={'MaxAIAIAdvanced'}
      sx={{
        width: '40px',
        height: '40px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : '#fff',
        boxShadow:
          '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
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
      <ContextMenuIcon
        sx={{
          color: 'text.primary',
          fontSize: '24px',
        }}
        icon={'Tune'}
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
        disableScrollLock
        PaperProps={{
          sx: {
            // ml: isMaxAIImmersiveChatPage() ? 0 : '8px',
          },
        }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            const MaxAIAIAdvancedCard = getMaxAISidebarRootElement()?.querySelector(
              '#MaxAIAIAdvancedCard',
            ) as HTMLElement
            if (MaxAIAIAdvancedCard) {
              const rect = MaxAIAIAdvancedCard.getBoundingClientRect()
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
            <Box
              id={'MaxAIAIAdvancedCard'}
              sx={{
                borderRadius: '4px',
                border: '1px solid #EBEBEB',
                boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
                width: 434,
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Stack spacing={1} p={1} width={'100%'}>
                {currentSidebarConversationType === 'Search' && (
                  <SearchAdvanced />
                )}
                {currentSidebarConversationType === 'Art' && <ArtAdvanced />}
                {currentSidebarConversationType === 'Chat' && <ChatAdvanced />}
                <Stack
                  sx={{ minHeight: '28px' }}
                  width={'100%'}
                  spacing={1}
                  alignItems={'center'}
                  direction={'row'}
                  justifyContent={'end'}
                  flexDirection={'row'}
                >
                  <IconButton
                    onClick={() => {
                      if (lockCloseRef.current) {
                        return
                      }
                      waitResetRef.current = true
                      handlePopoverClose()
                    }}
                  >
                    <ContextMenuIcon
                      icon={'Close'}
                      sx={{
                        fontSize: `24px`,
                      }}
                    />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  )
}
export default SearchWithAIAdvanced
