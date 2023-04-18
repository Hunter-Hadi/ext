import React, { useEffect, useMemo, useState } from 'react'
import './OptionsPage.less'
import { Box, Container, Stack, Typography } from '@mui/material'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import UseChatGPTOptionsSettingPage from '@/pages/options/pages/UseChatGPTOptionsSettingPage/index'
import UseChatGPTOptionsEditMenuPage from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { SnackbarProvider } from 'notistack'
import { useAuthLogin } from '@/features/auth'
import UseChatGPTOptionsLoginPage from '@/pages/options/pages/UseChatGPTOptionsLoginPage'
import AccountMenu from '@/pages/options/components/AccountMenu'

const OptionsPageRouteContext = React.createContext({
  route: '/',
  setRoute: (route: string) => {
    console.log('setRoute', route)
  },
})

const OptionsPage = () => {
  const { loaded, isLogin, loading } = useAuthLogin()
  const [route, setRoute] = useState('')
  useEffect(() => {
    if (loaded) {
      const params = new URLSearchParams(window.location.search)
      if (!isLogin) {
        setRoute('/login')
        return
      }
      if (params.get('route')) {
        setRoute(params.get('route') || '/')
      } else {
        setRoute('/')
      }
    }
  }, [isLogin, loaded])
  const crumbsText = useMemo(() => {
    if (route === '/login') {
      return 'Login'
    }
    if (route === '/') {
      return 'Settings'
    }
    if (route === 'menu') {
      return 'Edit Menu'
    }
    return ''
  }, [route])
  useEffect(() => {
    const hash = window.location.hash
    const timer = setTimeout(() => {
      document.getElementById(hash.replace('#', ''))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  return (
    <Stack
      sx={{
        height: '100vh',
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#202124' : '#fff'),
      }}
    >
      <SnackbarProvider maxSnack={3}>
        <OptionsPageRouteContext.Provider value={{ route, setRoute }}>
          <Box
            sx={{
              width: '100%',
              position: 'fixed',
              zIndex: 10000,
              top: 0,
              height: 72,
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
              bgcolor: (t) => (t.palette.mode === 'dark' ? '#202124' : '#fff'),
            }}
          >
            <Container maxWidth={'lg'} sx={{ p: 0 }}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
                height={'71px'}
              >
                <Stack direction={'row'} alignItems={'center'} spacing={1}>
                  <Box
                    component={'span'}
                    sx={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isLogin) {
                        setRoute('/')
                      }
                    }}
                  >
                    <UseChatGptIcon
                      sx={{
                        fontSize: 32,
                      }}
                    />
                  </Box>
                  <Typography
                    fontSize={24}
                    fontWeight={700}
                    sx={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isLogin) {
                        setRoute('/')
                      }
                    }}
                  >
                    UseChatGPT.AI
                  </Typography>
                  {crumbsText && (
                    <Typography fontSize={24} fontWeight={700}>
                      {crumbsText}
                    </Typography>
                  )}
                </Stack>
                {isLogin && <AccountMenu />}
              </Stack>
            </Container>
          </Box>
          <Container maxWidth={'lg'} sx={{ mt: 13 }}>
            <AppLoadingLayout loading={loading}>
              {route === '/login' && <UseChatGPTOptionsLoginPage />}
              {route === '/' && <UseChatGPTOptionsSettingPage />}
              {route === 'menu' && <UseChatGPTOptionsEditMenuPage />}
            </AppLoadingLayout>
          </Container>
        </OptionsPageRouteContext.Provider>
      </SnackbarProvider>
    </Stack>
  )
}

export default OptionsPage
