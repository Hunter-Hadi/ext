import React, { FC, useMemo, useState } from 'react'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/hooks/useEffectOnce'
import { GiftIcon } from '@/components/CustomIcon'
import Stack from '@mui/material/Stack'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import Link from '@mui/material/Link'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { getCurrentDomainHost } from '@/utils'
import { useTranslation } from 'react-i18next'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

const AuthUserRoleIconDropdown: FC = () => {
  const { currentUserPlan, syncUserInfo, syncUserSubscriptionInfo } =
    useUserInfo()
  const { t } = useTranslation(['common', 'client'])
  const [isHover, setIsHover] = useState(false)
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
  const userRole = useMemo(() => {
    return currentUserPlan.name
  }, [currentUserPlan])
  return (
    <LoginLayout>
      {userRole === 'pro' && (
        <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
          <Link
            href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
            target={'_blank'}
            underline={'none'}
          >
            <Stack
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              direction={'row'}
              alignItems={'center'}
              component={'div'}
              sx={{
                borderRadius: '4px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(178, 115, 255, 0.14)'
                    : 'rgba(118, 1, 211, 0.16)',
                fontSize: '12px',
                fontWeight: 700,
                py: '2px',
                px: '4px',
                color: (t) => {
                  if (t.palette.mode === 'dark') {
                    return isHover ? '#c17ff5' : '#7601D3'
                  } else {
                    return isHover ? 'primary.main' : 'text.primary'
                  }
                },
              }}
            >
              <span>Pro</span>
            </Stack>
          </Link>
        </TextOnlyTooltip>
      )}
      {userRole !== 'pro' && (
        <Link
          href={`${APP_USE_CHAT_GPT_HOST}/rewards`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            direction={'row'}
            alignItems={'center'}
            component={'div'}
            sx={{
              cursor: 'pointer',
              borderRadius: '99px',
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(178, 115, 255, 0.14)'
                  : 'rgba(118, 1, 211, 0.16)',
              fontSize: '12px',
              fontWeight: 600,
              py: '6px',
              px: '8px',
              color: (t) => {
                if (t.palette.mode === 'dark') {
                  return isHover ? 'rgb(178,155,255)' : '#c7a5f1'
                } else {
                  return isHover ? 'primary.main' : 'text.primary'
                }
              },
              gap: '2px',
            }}
          >
            <GiftIcon sx={{ fontSize: '14px' }} />
            <span>{t('client:rewards__title')}</span>
          </Stack>
        </Link>
      )}
    </LoginLayout>
  )
}
export default AuthUserRoleIconDropdown
