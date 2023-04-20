import React, { FC } from 'react'
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { APP_USE_CHAT_GPT_HOST } from '@/types'
import { useUseChatGPTUserInfo } from '@/features/chatgpt'
import useEffectOnce from '@/hooks/useEffectOnce'

const AccountMenu: FC = () => {
  const { syncUserInfo, userInfo, loading } = useUseChatGPTUserInfo()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  useEffectOnce(() => {
    syncUserInfo()
  })
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            {!loading && (
              <Avatar
                sx={{ width: 32, height: 32, textTransform: 'capitalize' }}
              >
                {userInfo?.email?.[0] || 'M'}
              </Avatar>
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem disabled>{userInfo?.email}</MenuItem>
        <MenuItem
          component={'a'}
          target={'_blank'}
          href={`${APP_USE_CHAT_GPT_HOST}/logout`}
          onClick={() => {
            handleClose()
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}
export default AccountMenu
