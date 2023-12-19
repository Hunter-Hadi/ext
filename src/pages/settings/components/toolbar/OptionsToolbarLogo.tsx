import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import AuthUserRoleIconDropdown from '@/features/auth/components/AuthUserRoleIconDropdown'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import OptionsLeftMenu from '@/pages/settings/components/OptionsLeftMenu'
import { SETTINGS_PAGE_MENU_WIDTH } from '@/pages/settings/pages/SettingsApp'

const OptionsToolbarLogo: FC = () => {
  const { t } = useTranslation(['settings', 'common', 'client'])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useCustomTheme()
  const isDownMd = useMediaQuery(theme.customTheme.breakpoints.down('md'))
  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setDrawerOpen(open)
  }
  return (
    <React.Fragment>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        {!isDownMd ? (
          <Link
            sx={{
              textDecoration: 'none!important',
            }}
            href={APP_USE_CHAT_GPT_HOST}
            target={'_blank'}
          >
            <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <Box component={'span'}>
                  <UseChatGptIcon
                    sx={{
                      fontSize: 32,
                    }}
                  />
                </Box>
                <Typography
                  fontSize={20}
                  fontWeight={700}
                  color={'text.primary'}
                >
                  MaxAI.me
                </Typography>
              </Stack>
            </TextOnlyTooltip>
          </Link>
        ) : (
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <Box component={'span'}>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                  toggleDrawer(true)(event)
                }}
              >
                <ContextMenuIcon
                  sx={{
                    fontSize: 24,
                  }}
                  icon={'Menu'}
                />
              </IconButton>
            </Box>
            <Link
              sx={{
                textDecoration: 'none!important',
              }}
              href={APP_USE_CHAT_GPT_HOST}
              target={'_blank'}
            >
              <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
                <Stack direction={'row'} alignItems={'center'} spacing={1}>
                  <Typography
                    fontSize={20}
                    fontWeight={700}
                    color={'text.primary'}
                  >
                    MaxAI.me
                  </Typography>
                </Stack>
              </TextOnlyTooltip>
            </Link>
          </Stack>
        )}
        <AuthUserRoleIconDropdown />
      </Stack>
      <Drawer anchor={'left'} open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          role={'presentation'}
          component={'div'}
          onKeyDown={toggleDrawer(false)}
          onClick={toggleDrawer(false)}
          sx={{
            width: SETTINGS_PAGE_MENU_WIDTH,
          }}
        >
          <Stack
            minHeight={56}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              boxSizing: 'border-box',
              pl: 2,
            }}
          >
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Link
                sx={{
                  textDecoration: 'none!important',
                }}
                href={APP_USE_CHAT_GPT_HOST}
                target={'_blank'}
              >
                <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <Box component={'span'}>
                      <UseChatGptIcon
                        sx={{
                          fontSize: 32,
                        }}
                      />
                    </Box>
                    <Typography
                      fontSize={20}
                      fontWeight={700}
                      color={'text.primary'}
                    >
                      MaxAI.me
                    </Typography>
                  </Stack>
                </TextOnlyTooltip>
              </Link>
              <AuthUserRoleIconDropdown />
            </Stack>
          </Stack>
          <OptionsLeftMenu />
        </Box>
      </Drawer>
    </React.Fragment>
  )
}

export default OptionsToolbarLogo
