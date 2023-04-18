import { Button, Link, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'
// import { UseChatGptIcon } from '@/components/CustomIcon'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
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
      <Link href={APP_USE_CHAT_GPT_HOST + '/login'} target={'_blank'}>
        <Button
          startIcon={<OpenInNewIcon />}
          variant={'outlined'}
          sx={{
            width: 400,
            height: 56,
            color: 'text.primary',
            fontSize: 24,
          }}
        >
          Continue
        </Button>
      </Link>
    </Stack>
  )
}
export default UseChatGPTOptionsLoginPage
