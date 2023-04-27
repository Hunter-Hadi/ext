import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import '../../OptionsPage.less'
import { Box, Container, Link, Stack, Typography } from '@mui/material'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import UseChatGPTOptionsSettingPage from '@/pages/options/pages/UseChatGPTOptionsSettingPage'
import UseChatGPTOptionsEditMenuPage from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { SnackbarProvider } from 'notistack'
import { useAuthLogin } from '@/features/auth/hooks'
import UseChatGPTOptionsLoginPage from '@/pages/options/pages/UseChatGPTOptionsLoginPage'
import AccountMenu from '@/pages/options/components/AccountMenu'
import { OptionsPageRouteContext } from '@/pages/options/context'
import { APP_USE_CHAT_GPT_HOST } from '@/types'

const UseChatGPTOptionsPage = () => {
  const { loaded, isLogin, loading } = useAuthLogin()
  const [route, setRoute] = useState('')
  const onceScorllRef = React.useRef(false)
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
    return 'Settings'
    // if (route === '/login') {
    //   return 'Settings'
    // }
    // if (route === '/') {
    //   return 'Settings'
    // }
    // if (route === 'menu') {
    //   return 'Edit Menu'
    // }
    // return ''
  }, [route])
  const scrollToHash = () => {
    if (onceScorllRef.current) {
      return
    }
    const hash = window.location.hash
    // timeout for wait for dom render
    const timeout = 3000
    const timer = setInterval(() => {
      const element = document.getElementById(hash.replace('#', ''))
      const rect = element?.getBoundingClientRect()
      const offset = window.pageYOffset || document.documentElement.scrollTop
      if (rect && rect.top > 0 && !onceScorllRef.current) {
        onceScorllRef.current = true
        const top = rect.top + offset - 72 - 24
        window.scrollTo({
          top,
          behavior: 'smooth',
        })
        clearInterval(timer)
        return
      }
    }, 100)
    setTimeout(() => {
      timer && clearTimeout(timer)
    }, timeout)
  }
  useLayoutEffect(() => {
    scrollToHash()
  })
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
                <Link
                  href={APP_USE_CHAT_GPT_HOST}
                  target={'_blank'}
                  underline={'none'}
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
                </Link>
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

export default UseChatGPTOptionsPage
