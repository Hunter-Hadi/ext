import { Button, Link, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'
// import { UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/types'
import { GoogleIcon } from '@/components/CustomIcon'
const UseChatGPTOptionsLoginPage: FC = () => {
  return (
    <Stack
      sx={{
        width: 600,
        mx: 'auto!important',
        alignItems: 'center',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={2}
        flexShrink={0}
        mb={4}
      >
        {/*<Box component={'span'}>*/}
        {/*  <UseChatGptIcon*/}
        {/*    sx={{*/}
        {/*      fontSize: 48,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</Box>*/}
        <Typography fontSize={24} fontWeight={700}>
          Log in to manage your settings and create custom prompts
        </Typography>
      </Stack>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/login?auto=true'}
        target={'_blank'}
        sx={{ width: '100%' }}
      >
        <Button
          fullWidth
          startIcon={<GoogleIcon />}
          disableElevation
          variant={'outlined'}
          sx={{
            height: 40,
            borderColor: 'customColor.borderColor',
            color: 'text.secondary',
            textIndent: '16px',
            fontSize: 14,
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          Log in with Google
        </Button>
      </Link>
    </Stack>
  )
}
export default UseChatGPTOptionsLoginPage
