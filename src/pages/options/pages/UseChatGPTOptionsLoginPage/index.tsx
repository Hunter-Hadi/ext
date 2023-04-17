import { Box, Button, Link, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'
import { GoogleIcon, UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/types'
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
        <Box component={'span'}>
          <UseChatGptIcon
            sx={{
              fontSize: 48,
            }}
          />
        </Box>
        <Typography fontSize={48} fontWeight={700}>
          UseChatGPT.AI
        </Typography>
      </Stack>
      <Link href={APP_USE_CHAT_GPT_HOST + '/login'} target={'_blank'}>
        <Button
          startIcon={<GoogleIcon />}
          variant={'outlined'}
          sx={{
            width: 400,
            height: 56,
            color: 'text.primary',
            textIndent: '16px',
            fontSize: 14,
          }}
        >
          Sign in with Google
        </Button>
      </Link>
    </Stack>
  )
}
export default UseChatGPTOptionsLoginPage
