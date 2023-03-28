import React, { useEffect, useState } from 'react'
import './OptionsPage.less'
import { Container, Stack, Typography } from '@mui/material'
import AppLoadingLayout from '@/components/LoadingLayout'
import UseChatGPTOptionsSettingPage from '@/pages/options/pages/UseChatGPTOptionsSettingPage'
import UseChatGPTOptionsEditMenuPage from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage'
import { UseChatGptIcon } from '@/components/CustomIcon'

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
  return (
    <Container maxWidth={'lg'}>
      <Stack spacing={8} my={4}>
        <Stack direction={'row'} alignItems={'center'} spacing={2}>
          <UseChatGptIcon
            sx={{
              fontSize: 32,
            }}
          />
          <Typography fontSize={24} fontWeight={700}>
            UseChatGPT.AI
          </Typography>
        </Stack>
        <AppLoadingLayout loading={loading}>
          <p>route: {route}</p>
          {route === '/' && <UseChatGPTOptionsSettingPage />}
          {route === 'menu' && <UseChatGPTOptionsEditMenuPage />}
        </AppLoadingLayout>
      </Stack>
    </Container>
  )
}

export default OptionsPage
