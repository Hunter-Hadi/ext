import React, { FC, useState } from 'react'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Drawer from '@mui/material/Drawer'
import { SETTINGS_PAGE_MENU_WIDTH } from '@/pages/settings/pages/SettingsApp'
import OptionsLeftMenu from '@/pages/settings/components/OptionsLeftMenu'
import { useTranslation } from 'react-i18next'

const OptionsToolbarLogo: FC = () => {
  const { t } = useTranslation(['common'])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
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
      <Link href={APP_USE_CHAT_GPT_HOST} target={'_blank'} underline={'none'}>
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
          <Box
            component={'span'}
            sx={{
              cursor: 'pointer',
            }}
          >
            <UseChatGptIcon
              sx={{
                display: {
                  xs: 'none',
                  md: 'inline-flex',
                },
                fontSize: 32,
              }}
            />
            <IconButton
              onClick={(event) => {
                event.stopPropagation()
                event.preventDefault()
                toggleDrawer(true)(event)
              }}
              sx={{
                display: {
                  xs: 'inline-flex',
                  md: 'none',
                },
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
          <Typography
            fontSize={20}
            fontWeight={700}
            sx={{
              cursor: 'pointer',
            }}
          >
            MaxAI.me {t('common:settings')}
          </Typography>
        </Stack>
      </Link>
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
            <Link
              href={APP_USE_CHAT_GPT_HOST}
              target={'_blank'}
              underline={'none'}
            >
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <UseChatGptIcon
                  sx={{
                    fontSize: 32,
                  }}
                />
                <Typography
                  fontSize={20}
                  fontWeight={700}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  MaxAI.me {t('common:settings')}
                </Typography>
              </Stack>
            </Link>
          </Stack>
          <OptionsLeftMenu />
        </Box>
      </Drawer>
    </React.Fragment>
  )
}

export default OptionsToolbarLogo
