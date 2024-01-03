import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import AppearanceHelp from '@/pages/settings/components/pageHelp/pages/AppearanceHelp'
import ChatGPTStableModeHelp from '@/pages/settings/components/pageHelp/pages/ChatGPTStableModeHelp'
import OpenaiAPIKeyHelp from '@/pages/settings/components/pageHelp/pages/OpenaiAPIKeyHelp'
import PromptsHelp from '@/pages/settings/components/pageHelp/pages/PromptsHelp'
import { SettingsPageRouteContext } from '@/pages/settings/context'
import { SETTINGS_PAGE_MENU_WIDTH } from '@/pages/settings/pages/SettingsApp'

const PageHelp: FC<{
  drawerMode?: boolean
  defaultOpen?: boolean
}> = ({ defaultOpen, drawerMode }) => {
  const { route } = useContext(SettingsPageRouteContext)
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
  const RenderDom = useMemo(() => {
    switch (route) {
      case '/my-own-prompts': {
        return <PromptsHelp defaultOpen={defaultOpen} />
      }
      case '/openai-api-key': {
        return <OpenaiAPIKeyHelp defaultOpen={defaultOpen} />
      }
      case '/appearance': {
        return <AppearanceHelp defaultOpen={defaultOpen} />
      }
      case '/chatgpt-stable-mode': {
        return <ChatGPTStableModeHelp defaultOpen={defaultOpen} />
      }
    }
    return null
  }, [route, defaultOpen])
  if (!RenderDom) {
    return null
  }
  if (drawerMode) {
    return (
      <>
        <Button
          onClick={toggleDrawer(true)}
          sx={{
            minWidth: 80,
            color: 'text.primary',
            display: {
              xs: 'inline-flex',
              lg: 'none',
            },
          }}
        >
          <PageHelpLabel />
        </Button>
        <Drawer
          anchor={'right'}
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          <Box
            role={'presentation'}
            component={'div'}
            onKeyDown={toggleDrawer(false)}
            onClick={toggleDrawer(false)}
            sx={{
              width: SETTINGS_PAGE_MENU_WIDTH,
            }}
          >
            <Stack spacing={1}>
              <PageHelpLabel sx={{ mt: 1, ml: 1 }} />
              {RenderDom}
            </Stack>
          </Box>
        </Drawer>
      </>
    )
  }
  return (
    <Stack
      spacing={1}
      sx={{
        '& .max-ai__settings__page-help-card + .max-ai__settings__page-help-card':
          {
            borderTop: '1px solid',
            borderColor: 'customColor.borderColor',
          },
      }}
    >
      <PageHelpLabel />
      {RenderDom}
    </Stack>
  )
}

export const PageHelpLabel: FC<{
  sx?: SxProps
}> = ({ sx }) => {
  const { t } = useTranslation(['common'])
  return (
    <Box
      sx={{
        maxWidth: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <ContextMenuIcon icon={'HelpOutline'} sx={{ fontSize: 20 }} />
      <Typography
        fontSize={16}
        fontWeight={800}
        component={'h2'}
        display={'inline-flex'}
      >
        {t('common:help')}
      </Typography>
    </Box>
  )
}
export default PageHelp
