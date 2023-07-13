import React, { FC, useMemo, useRef } from 'react'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/hooks/useEffectOnce'
import IconDropdown from '@/components/IconDropdown'
import { ColorGiftIcon } from '@/components/CustomIcon'
import Stack from '@mui/material/Stack'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { getCurrentDomainHost } from '@/utils'
import { useFocus } from '@/hooks/useFocus'

const AuthUserRoleIconDropdown: FC = () => {
  const { userInfo, syncUserInfo, syncUserSubscriptionInfo } = useUserInfo()
  useEffectOnce(() => {
    syncUserInfo().then()
    if (String(APP_USE_CHAT_GPT_HOST).includes(getCurrentDomainHost())) {
      const pathname = window.location.pathname
      if (
        ['/my-plan', '/pricing', '/payment/error', '/payment/success'].includes(
          pathname,
        )
      ) {
        syncUserSubscriptionInfo().then()
      }
    }
  })
  useFocus(() => {
    syncUserInfo().then()
  })
  const userRoleRef = useRef('')
  const userRole = useMemo(() => {
    let role = 'free'
    if (userInfo && userInfo.role?.name === 'pro') {
      role = 'pro'
    }
    userRoleRef.current = role
    return role
  }, [userInfo])
  const MemoIcon = useMemo(() => {
    if (userRole === 'pro') {
      return (
        <Box
          sx={{
            borderRadius: '4px',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(178, 115, 255, 0.32)'
                : 'rgba(118, 1, 211, 0.16)',
            fontSize: '12px',
            fontWeight: 700,
            py: '2px',
            px: '4px',
            color: (t) =>
              t.palette.mode === 'dark' ? '#B273FF' : 'text.primary',
          }}
        >
          Pro
        </Box>
      )
    }
    return <ColorGiftIcon />
  }, [userRole])
  return (
    <LoginLayout>
      {userRole === 'pro' && MemoIcon}
      {userRole === 'free' && (
        <IconDropdown icon={MemoIcon}>
          <Stack maxWidth={400}>
            <Link
              width={'100%'}
              href={APP_USE_CHAT_GPT_HOST + '/referral'}
              target={'_blank'}
              underline={'none'}
            >
              <Stack
                spacing={1}
                p={1}
                mx={1}
                my={2}
                textAlign={'center'}
                sx={{
                  alignItems: 'center',
                  borderRadius: '4px',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgb(3,19,11)'
                      : 'rgb(229,246,253)',
                }}
              >
                <img
                  src={`https://app.maxai.me/assets/images/referral/invite-your-friends-light.png`}
                  alt="invite your friends"
                  width={360}
                  height={98}
                />
                <Typography
                  fontSize={20}
                  color={'text.primary'}
                  fontWeight={700}
                >
                  Get up to 24 free weeks of MaxAI Pro!
                </Typography>
                <Typography fontSize={14} color={'text.primary'}>
                  <span>
                    {`Invite your friends to join MaxAI.me! For anyone who signs up using your referral link and installs MaxAI.me extension, we'll give you both one week of Pro for free! To extend your Pro access further, `}
                  </span>
                  <Link
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
                    target={'_blank'}
                  >
                    {'upgrade your account'}
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
          </Stack>
        </IconDropdown>
      )}
    </LoginLayout>
  )
}
export default AuthUserRoleIconDropdown
