import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import React, { type FC, lazy, useEffect, useRef, useState } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { useAuthLogin } from '@/features/auth'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { useInitMixPanel } from '@/features/mixpanel/utils'
import useClientMessageListenerForBackground from '@/features/sidebar/hooks/useClientMessageListenerForBackground'
import OptionsLeftMenu from '@/pages/settings/components/OptionsLeftMenu'
import PageHelp from '@/pages/settings/components/pageHelp'
import SyncSettingCheckerWrapper from '@/pages/settings/components/SyncSettingCheckerWrapper'
import OptionsToolbarLogo from '@/pages/settings/components/toolbar/OptionsToolbarLogo'
import {
  getLocationHashRoute,
  setLocationHashRoute,
  SettingsPageRouteContext,
} from '@/pages/settings/context'
import SettingsLoginPage from '@/pages/settings/pages/login'

export const SETTINGS_PAGE_MENU_WIDTH = {
  xs: 250,
  sm: 250,
  md: 250,
  lg: 250,
  xl: 250,
}

export const SETTINGS_PAGE_CONTENT_WIDTH = {
  xs: 400,
  sm: 680,
  md: 800,
  lg: 680,
  xl: 800,
}

const SettingsMePage = lazy(() => import('@/pages/settings/pages/me'))
const SettingsHelpPage = lazy(() => import('@/pages/settings/pages/help'))
const SettingsMyOwnPromptsPage = lazy(
  () => import('@/pages/settings/pages/prompts'),
)
const SettingsOpenaiAPIKeyPage = lazy(
  () => import('@/pages/settings/pages/openai_api_key'),
)

const SettingsShortcutPage = lazy(
  () => import('@/pages/settings/pages/shortcut'),
)
const SettingsAppearancePage = lazy(
  () => import('@/pages/settings/pages/appearance'),
)
const SettingsMiniMenuPage = lazy(
  () => import('@/pages/settings/pages/mini_menu'),
)
const SettingsHelpMeWritePage = lazy(
  () => import('@/pages/settings/pages/help_me_write'),
)
const SettingsLanguagePage = lazy(
  () => import('@/pages/settings/pages/language'),
)
const SettingsChatGPTStableModePage = lazy(
  () => import('@/pages/settings/pages/chatgpt_stable_mode'),
)
const SettingsPerksPage = lazy(() => import('@/pages/settings/pages/perks'))
const SettingsSearchWithAIPage = lazy(
  () => import('@/pages/settings/pages/search_with_ai'),
)
const SettingsDevTestPrompt = React.lazy(
  () => import('@/pages/settings/pages/dev_test_prompt'),
)
const SettingsSidebarPage = React.lazy(
  () => import('@/pages/settings/pages/sidebar'),
)

const SettingsApp: FC = () => {
  const { loaded, isLogin } = useAuthLogin()
  const onceScrollRef = useRef(false)
  const [route, setRoute] = useState(() =>
    getLocationHashRoute()[0],
  )

  useEffect(() => {
    if (route) {
      if (getLocationHashRoute()[0] !== route) {
        setLocationHashRoute(route)
      }
    }
  }, [route])

  useEffect(() => {
    if (route && isLogin && !onceScrollRef.current) {
      const locationSearch = window.location.search
      const searchParams = locationSearch.split('?')[1]?.split('&')
      const searchParamsMap = new Map<string, string>()
      searchParams?.forEach((searchParam) => {
        const [key, value] = searchParam.split('=')
        searchParamsMap.set(key, value)
      })
      if (searchParamsMap.get('id')) {
        onceScrollRef.current = true
        const maxRenderTime = 3000
        const intervalTimer = setInterval(() => {
          const hTag = document.getElementById(searchParamsMap.get('id')!)
          if (hTag) {
            clearInterval(intervalTimer)
            hTag.scrollIntoView({
              behavior: 'smooth',
            })
          }
        }, 100)
        const timer = setTimeout(() => {
          clearInterval(intervalTimer)
        }, maxRenderTime)
        return () => {
          clearTimeout(timer)
          clearInterval(intervalTimer)
        }
      }
    }
    return () => {
      // do nothing
    }
  }, [route, isLogin])
  useClientMessageListenerForBackground()
  useInitMixPanel()
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
              <PageHelp drawerMode defaultOpen />
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
          <AppSuspenseLoadingLayout>
            <AppLoadingLayout loading={!loaded}>
              {isLogin ? (
                <SyncSettingCheckerWrapper>
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
                      <OptionsLeftMenu
                        sx={{ width: SETTINGS_PAGE_MENU_WIDTH }}
                      />
                    </Stack>
                  </Box>
                  {/*content*/}
                  <Stack
                    flex={'1 1 0'}
                    flexBasis={SETTINGS_PAGE_CONTENT_WIDTH}
                    sx={{ maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}
                  >
                    <Stack
                      width={SETTINGS_PAGE_CONTENT_WIDTH}
                      mx={'auto'}
                      pt={2}
                    >
                      {route === '/me' && <SettingsMePage />}
                      {route === '/help' && <SettingsHelpPage />}
                      {route === '/my-own-prompts' && (
                        <SettingsMyOwnPromptsPage />
                      )}
                      {route === '/openai-api-key' && (
                        <SettingsOpenaiAPIKeyPage />
                      )}
                      {route === '/sidebar' && <SettingsSidebarPage />}
                      {route === '/shortcut' && <SettingsShortcutPage />}
                      {route === '/appearance' && <SettingsAppearancePage />}
                      {route === '/mini-menu' && <SettingsMiniMenuPage />}
                      {route === '/help-me-write' && (
                        <SettingsHelpMeWritePage />
                      )}
                      {route === '/language' && <SettingsLanguagePage />}
                      {route === '/chatgpt-stable-mode' && (
                        <SettingsChatGPTStableModePage />
                      )}
                      {route === '/perks' && <SettingsPerksPage />}
                      {route === '/search-with-ai' && (
                        <SettingsSearchWithAIPage />
                      )}
                      {route === '/dev-test-prompt' && (
                        <SettingsDevTestPrompt />
                      )}
                    </Stack>
                  </Stack>
                  {/*right*/}
                  <Stack
                    direction={'row'}
                    flex={'1 1 0'}
                    justifyContent={'start'}
                    sx={{
                      pt: 2,
                      display: {
                        xs: 'none',
                        lg: 'flex',
                      },
                    }}
                  >
                    <Stack width={SETTINGS_PAGE_MENU_WIDTH}>
                      <PageHelp defaultOpen />
                    </Stack>
                  </Stack>
                </SyncSettingCheckerWrapper>
              ) : (
                <SettingsLoginPage />
              )}
            </AppLoadingLayout>
          </AppSuspenseLoadingLayout>
        </Box>
      </Stack>
    </SettingsPageRouteContext.Provider>
  )
}
export default SettingsApp
