import React, { useEffect, useMemo, useState } from 'react'
import './OptionsPage.less'
import { Box, Container, Stack, Typography } from '@mui/material'
import AppLoadingLayout from '@/components/LoadingLayout'
import UseChatGPTOptionsSettingPage from '@/pages/options/pages/UseChatGPTOptionsSettingPage/index'
import UseChatGPTOptionsEditMenuPage from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage'
import { UseChatGptIcon } from '@/components/CustomIcon'

const OptionsPageRouteContext = React.createContext({
  route: '/',
  setRoute: (route: string) => {
    console.log('setRoute', route)
  },
})

const OptionsPage = () => {
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState('/')
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    console.log(params)
    if (params.get('route')) {
      setRoute(params.get('route') || '/')
    }
    setLoading(false)
  }, [])
  const crumbsText = useMemo(() => {
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
    <Container
      maxWidth={'lg'}
      sx={{
        height: '100vh',
        py: 2,
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#202124' : '#fff'),
      }}
    >
      <OptionsPageRouteContext.Provider value={{ route, setRoute }}>
        <Stack height={'100%'}>
          <Stack
            direction={'row'}
            alignItems={'center'}
            spacing={2}
            flexShrink={0}
            mb={4}
          >
            <Box
              component={'span'}
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => {
                setRoute('/')
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
                setRoute('/')
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
          <Stack flex={1} height={0}>
            <AppLoadingLayout loading={loading}>
              {route === '/' && <UseChatGPTOptionsSettingPage />}
              {route === 'menu' && <UseChatGPTOptionsEditMenuPage />}
            </AppLoadingLayout>
          </Stack>
        </Stack>
      </OptionsPageRouteContext.Provider>
    </Container>
  )
}

export default OptionsPage
