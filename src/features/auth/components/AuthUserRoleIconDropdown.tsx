import React, { FC, useMemo, useRef } from 'react'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/hooks/useEffectOnce'
import IconDropdown from '@/components/IconDropdown'
import { ColorGiftIcon } from '@/components/CustomIcon'
import Stack from '@mui/material/Stack'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { useFocus } from '@/hooks/useFocus'

const AuthUserRoleIconDropdown: FC = () => {
  const { userInfo, syncUserInfo, loading, syncUserSubscriptionInfo } =
    useUserInfo()
  useEffectOnce(() => {
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
  useFocus(() => {
    if (userRoleRef.current === 'free') {
      syncUserSubscriptionInfo().then()
    }
  })
  const MemoIcon = useMemo(() => {
    if (userRole === 'pro') {
      return (
        <Box
          sx={{
            ml: 1,
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
      <AppLoadingLayout loadingText={''} loading={loading} size={16}>
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
                  <Typography
                    fontSize={20}
                    color={'text.primary'}
                    fontWeight={700}
                  >
                    Get up to 24 weeks of Free AI without a daily limit!
                  </Typography>
                  <Typography fontSize={14} color={'text.primary'}>
                    {`Invite your friends to join MaxAI.me! For anyone who signs up
              using your referral link and installs MaxAI.me extension,
              we'll give you both 1 week of Free AI without a daily limit!`}
                  </Typography>
                  <img
                    src={`https://app.maxai.me/assets/images/referral/invite-your-friends-light.png`}
                    alt="invite your friends"
                    width={360}
                    height={98}
                  />
                  <Button
                    variant={'contained'}
                    color={'primary'}
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                    fullWidth
                  >
                    Invite your friends
                  </Button>
                </Stack>
              </Link>
            </Stack>
          </IconDropdown>
        )}
      </AppLoadingLayout>
    </LoginLayout>
  )
}
export default AuthUserRoleIconDropdown
