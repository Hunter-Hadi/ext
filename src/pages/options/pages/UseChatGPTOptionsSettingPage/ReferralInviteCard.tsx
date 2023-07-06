import React, { FC } from 'react'
import CloseAlert from '@/components/CloseAlert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'

const ReferralInviteCard: FC = () => {
  return null
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
          <img
            src={`https://app.maxai.me/assets/images/referral/invite-your-friends-light.png`}
            alt="invite your friends"
            width={488}
            height={133.3}
          />
          <Typography fontSize={20} color={'text.primary'} fontWeight={700}>
            Get up to 24 weeks of MaxAI Pro for free!
          </Typography>
          <Typography fontSize={14} color={'text.primary'}>
            <span>
              {`Invite your friends to join MaxAI.me! For anyone who signs up using your referral link and installs MaxAI.me extension, we'll give you both one week of Pro for free! To extend your Pro access further, `}
            </span>
            <Link href={`${APP_USE_CHAT_GPT_HOST}/pricing`} target={'_blank'}>
              {`upgrade your account.`}
            </Link>
            <span>{`.`}</span>
          </Typography>
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
