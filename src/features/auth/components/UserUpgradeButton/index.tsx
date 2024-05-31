import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { getMaxAISidebarRootElement } from '@/utils'

const UserUpgradeButton: FC<{ sx?: SxProps }> = ({ sx }) => {
  const { isFreeUser } = useUserInfo()
  const { t } = useTranslation(['client'])
  const { currentConversationId, currentSidebarConversationType } =
    useClientConversation()

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const href = `${APP_USE_CHAT_GPT_HOST}/pricing`

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    authEmitPricingHooksLog('show', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
    })
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const handleClick = () => {
    handlePopoverClose()
    authEmitPricingHooksLog('click', 'PROACTIVE_UPGRADE', {
      conversationId: currentConversationId,
      conversationType: currentSidebarConversationType,
    })
    window.open(href)
  }

  if (!isFreeUser) return null

  return (
    <LoginLayout>
      <Button
        sx={{
          borderRadius: 2,
          p: 0.5,
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(178, 115, 255, 0.16)'
              : 'rgba(118, 1, 211, 0.08)',
          '&:hover': {
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(178, 115, 255, 0.24)'
                : 'rgba(118, 1, 211, 0.12)',
          },
          ...sx,
        }}
        onClick={handleClick}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <Typography
          mx={0.5}
          fontSize={14}
          fontWeight={700}
          lineHeight={1.4}
          color="text.primary"
          sx={{
            userSelect: 'none',
          }}
        >
          {/*{t('client:sidebar__top_bar__upgrade__title')}*/}
          Upgrade
        </Typography>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="top"
          container={getMaxAISidebarRootElement()}
          onClick={event => {
            event.stopPropagation()
          }}
          transition
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: 'center bottom',
              }}
            >
              <Paper
                sx={{
                  borderRadius: 2.5,
                  border: '1px solid #EBEBEB',
                  boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
                  minWidth: 300,
                  p: 2,
                  mb: 1,
                }}
              >
                <Stack spacing={2}>
                  <Typography fontSize={18} fontWeight={600}>
                    {t('client:sidebar__user_upgrade_card__title')}
                  </Typography>

                  <Divider />

                  <Stack direction="row" spacing={1}>
                    <CheckCircleOutlineIcon
                      sx={{ color: 'rgba(0, 170, 61, 1)' }}
                    />
                    <Typography>
                      {t('client:sidebar__user_upgrade_card__item1__title')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <CheckCircleOutlineIcon
                      sx={{ color: 'rgba(0, 170, 61, 1)' }}
                    />
                    <Typography>
                      {t('client:sidebar__user_upgrade_card__item2__title')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <CheckCircleOutlineIcon
                      sx={{ color: 'rgba(0, 170, 61, 1)' }}
                    />
                    <Typography>
                      {t('client:sidebar__user_upgrade_card__item3__title')}
                    </Typography>
                  </Stack>

                  <Link
                    color="primary.main"
                    target="_blank"
                    underline="none"
                    onClick={handleClick}
                    sx={{ cursor: 'pointer' }}
                  >
                    {t('client:sidebar__user_upgrade_card__learn_more__title')}
                  </Link>

                  <Box position="relative">
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
                      sx={{
                        fontSize: 16,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                      }}
                      onClick={handleClick}
                    >
                      {t('client:sidebar__top_bar__upgrade__title')}
                    </Button>
                    <Typography
                      fontSize={12}
                      mt={0.5}
                      color="text.secondary"
                      textAlign="center"
                    >
                      {t('client:sidebar__user_upgrade_card__footer__title')}
                    </Typography>
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 10,
                        top: 0,
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255, 126, 53, 1)',
                        color: '#fff',
                        borderRadius: 2,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography fontSize={16} fontWeight={500} lineHeight={1}>
                        {t('client:sidebar__user_upgrade_card__discount__title')}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Button>
    </LoginLayout>
  )
}
export default UserUpgradeButton
