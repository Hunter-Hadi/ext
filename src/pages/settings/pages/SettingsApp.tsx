import React, { FC, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import OptionsToolbarLogo from '@/pages/settings/components/toolbar/OptionsToolbarLogo'
import Box from '@mui/material/Box'
import {
  getLocationHashRoute,
  SettingsPageRouteContext,
  setLocationHashRoute,
} from '@/pages/settings/context'
import OptionsLeftMenu from '@/pages/settings/components/OptionsLeftMenu'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { useAuthLogin } from '@/features/auth'
import Browser from 'webextension-polyfill'

export const SETTINGS_PAGE_MENU_WIDTH = 250
export const SETTINGS_PAGE_CONTENT_WIDTH = 800

const SettingsMePage = React.lazy(() => import('@/pages/settings/pages/me'))
const SettingsHelpPage = React.lazy(() => import('@/pages/settings/pages/help'))

const SettingsApp: FC = () => {
  const { loading } = useAuthLogin()
  const [route, setRoute] = useState(() => getLocationHashRoute())
  useEffect(() => {
    if (route) {
      if (getLocationHashRoute() !== route) {
        setLocationHashRoute(route)
      }
    }
    console.log(
      Browser.i18n.getAcceptLanguages().then((code) => {
        console.log(code)
      }),
    )
  }, [route])
  return (
    <SettingsPageRouteContext.Provider value={{ route, setRoute }}>
      <Stack height={'100vh'}>
        {/*toolbar*/}
        <Stack
          minHeight={56}
          direction={'row'}
          alignItems={'center'}
          sx={{
            borderBottom: (t) =>
              t.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : '1px solid rgba(0, 0, 0, 0.12)',
            boxSizing: 'border-box',
          }}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            maxWidth={'xl'}
            mx={'auto'}
            width={'100%'}
            px={2}
          >
            <Stack direction={'row'} flex={'1 1 0'}>
              <Box width={SETTINGS_PAGE_MENU_WIDTH}>
                <OptionsToolbarLogo />
              </Box>
            </Stack>
            <Stack
              direction={'row'}
              flex={'1 1 0'}
              flexBasis={SETTINGS_PAGE_CONTENT_WIDTH}
            >
              {/*TODO search bar*/}
            </Stack>
            <Stack direction={'row'} flex={'1 1 0'} justifyContent={'end'}>
              {/*<AccountMenu />*/}
            </Stack>
          </Stack>
        </Stack>
        {/*content*/}
        <Box
          flex={1}
          display={'flex'}
          alignItems={'flex-start'}
          overflow={'overlay'}
          maxWidth={'xl'}
          mx={'auto'}
          width={'100%'}
          px={2}
        >
          {/*left menu*/}
          <Box
            flex={'1 1 0'}
            sx={{
              justifyContent: 'end',
              height: '100%',
              position: 'sticky',
              top: 0,
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >
            <Stack direction={'row'}>
              <OptionsLeftMenu sx={{ width: SETTINGS_PAGE_MENU_WIDTH }} />
            </Stack>
          </Box>
          {/*content*/}
          <Stack flex={'1 1 0'} flexBasis={SETTINGS_PAGE_CONTENT_WIDTH}>
            <Stack width={SETTINGS_PAGE_CONTENT_WIDTH} mx={'auto'} pt={2}>
              <AppSuspenseLoadingLayout>
                <AppLoadingLayout loading={loading}>
                  {route === '/people' && <SettingsMePage />}
                  {route === '/help' && <SettingsHelpPage />}
                </AppLoadingLayout>
              </AppSuspenseLoadingLayout>
            </Stack>
          </Stack>
          {/*right*/}
          <Stack
            direction={'row'}
            flex={'1 1 0'}
            justifyContent={'start'}
          ></Stack>
        </Box>
      </Stack>
    </SettingsPageRouteContext.Provider>
  )
}
export default SettingsApp
