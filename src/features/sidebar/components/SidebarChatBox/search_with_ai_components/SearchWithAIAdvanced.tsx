import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import SearchWithAIMaxSearchResultsSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIMaxSearchResultsSelector'
import SearchWithAISearchEngineSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAISearchEngineSelector'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { AppLocalStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

/**
 * 搜索页的AI设置
 * @constructor
 * @since 2023-10-26
 */
const SearchWithAIAdvanced: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['client', 'common'])
  const { currentSidebarConversationType } = useSidebarSettings()
  const appLocalStorage = useRecoilValue(AppLocalStorageState)
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
    if (currentSidebarConversationType !== 'Search') {
      return null
    }
    return (
      <Box
        id={'maxaiSearchWithAIAdvanced'}
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
              ml: isMaxAIImmersiveChatPage() ? 0 : '8px',
            },
          }}
        >
          <ClickAwayListener
            onClickAway={(event) => {
              const maxaiSearchWithAIAdvancedCard = getMaxAISidebarRootElement()?.querySelector(
                '#maxaiSearchWithAIAdvancedCard',
              ) as HTMLElement
              if (maxaiSearchWithAIAdvancedCard) {
                const rect = maxaiSearchWithAIAdvancedCard.getBoundingClientRect()
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
                id={'maxaiSearchWithAIAdvancedCard'}
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
                  <Stack direction={'row'} mb={1}>
                    <Typography
                      fontSize={'16px'}
                      fontWeight={600}
                      color={'text.primary'}
                    >
                      {t('client:sidebar__search_with_ai__advanced__title')}
                    </Typography>
                  </Stack>
                  <Stack spacing={2} width={'100%'}>
                    <SearchWithAISearchEngineSelector />
                    <SearchWithAIMaxSearchResultsSelector />
                  </Stack>
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
  }, [
    appLocalStorage.sidebarSettings?.common?.currentAIProvider,
    open,
    currentSidebarConversationType,
  ])
}
export default SearchWithAIAdvanced
