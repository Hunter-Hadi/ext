import React, { FC } from 'react'
import CloseAlert from '@/components/CloseAlert'
import { Button, Link, Stack, Typography } from '@mui/material'
import { APP_USE_CHAT_GPT_HOST } from '@/types'

const ReferralInviteCard: FC = () => {
  return (
    <CloseAlert
      icon={<></>}
      sx={{
        // bgcolor: '#E2E8F0',
        mt: 1,
        mb: 2,
      }}
    >
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/referral'}
        target={'_blank'}
        underline={'none'}
      >
        <Stack spacing={1} textAlign={'center'}>
          <Typography fontSize={20} color={'text.primary'} fontWeight={700}>
            Get up to 24 weeks of UseChatGPT.AI quota for free!
          </Typography>
          <Typography fontSize={14} color={'text.primary'}>
            {`Invite your friends to join UseChatGPT.AI, and for each one who signs
          up and installs UseChatGPT.AI extension we'll give you both 1 week of
          quota for free!`}
          </Typography>
          <img
            src={`https://app.usechatgpt.ai/assets/images/referral/invite-your-friends-light.png`}
            alt="invite your friends"
            width={488}
            height={133.3}
          />
          <Button
            variant={'contained'}
            color={'primary'}
            sx={{
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            Invite your friends
          </Button>
        </Stack>
      </Link>
    </CloseAlert>
  )
}
export default ReferralInviteCard