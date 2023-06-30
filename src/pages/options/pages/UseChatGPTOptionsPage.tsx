import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { SnackbarProvider } from 'notistack'
import { useAuthLogin } from '@/features/auth/hooks'
import AccountMenu from '@/pages/options/components/AccountMenu'
import { OptionsPageRouteContext } from '@/pages/options/context'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'

const UseChatGPTOptionsLoginPage = React.lazy(
  () => import('@/pages/options/pages/UseChatGPTOptionsLoginPage'),
)
const UseChatGPTOptionsSettingPage = React.lazy(
  () => import('@/pages/options/pages/UseChatGPTOptionsSettingPage'),
)
const UseChatGPTOptionsEditMenuPage = React.lazy(
  () => import('@/pages/options/pages/UseChatGPTOptionsEditMenuPage'),
)

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
    const timeout = 5000
    const timer = setInterval(() => {
      const element = document.getElementById(hash.replace('#', ''))
      if (element) {
        clearInterval(timer)
        setTimeout(() => {
          const rect = element?.getBoundingClientRect()
          const offset =
            window.pageYOffset || document.documentElement.scrollTop
          if (rect && rect.top > 0 && !onceScorllRef.current) {
            onceScorllRef.current = true
            const top = rect.top + offset - 104
            window.scrollTo({
              top,
              behavior: 'smooth',
            })
            return
          }
        }, 500)
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
              zIndex: 1100,
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
                      MaxAI.me
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
            <AppSuspenseLoadingLayout>
              <AppLoadingLayout loading={loading}>
                {route === '/login' && <UseChatGPTOptionsLoginPage />}
                {route === '/' && <UseChatGPTOptionsSettingPage />}
                {route === 'menu' && <UseChatGPTOptionsEditMenuPage />}
              </AppLoadingLayout>
            </AppSuspenseLoadingLayout>
          </Container>
        </OptionsPageRouteContext.Provider>
      </SnackbarProvider>
    </Stack>
  )
}

export default UseChatGPTOptionsPage
