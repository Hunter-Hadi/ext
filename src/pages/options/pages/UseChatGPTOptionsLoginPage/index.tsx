import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
// import { UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { GoogleIcon } from '@/components/CustomIcon'
import Divider from '@mui/material/Divider'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
const UseChatGPTOptionsLoginPage: FC = () => {
  return (
    <Stack
      sx={{
        width: 600,
        mx: 'auto!important',
        alignItems: 'center',
      }}
      spacing={2}
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
          Please sign in to manage your settings and create custom prompts
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
          Continue with Google
        </Button>
      </Link>
      <Divider sx={{ width: '100%' }}>OR</Divider>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/login-email'}
        target={'_blank'}
        sx={{ width: '100%' }}
      >
        <Button
          fullWidth
          startIcon={<ContextMenuIcon icon={'Email'} />}
          disableElevation
          variant={'contained'}
          sx={{
            height: 40,
            textIndent: '16px',
            fontSize: 14,
          }}
        >
          Continue with Email
        </Button>
      </Link>
    </Stack>
  )
}
export default UseChatGPTOptionsLoginPage
