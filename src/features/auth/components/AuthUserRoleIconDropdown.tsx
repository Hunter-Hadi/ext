import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { GiftIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import LoginLayout from '@/features/auth/components/LoginLayout'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'

const AuthUserRoleIconDropdown: FC = () => {
  const { currentUserPlan, isFreeUser } = useUserInfo()
  const userRole = currentUserPlan.name
  const { t } = useTranslation(['common', 'client'])
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
              direction={'row'}
              alignItems={'center'}
              component={'div'}
              sx={{
                borderRadius: '4px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(178, 115, 255, 0.16)'
                    : 'rgba(118, 1, 211, 0.08)',
                fontSize: '12px',
                fontWeight: 700,
                py: '2px',
                px: '4px',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(178, 115, 255, 0.24)'
                      : 'rgba(118, 1, 211, 0.12)',
                },
              }}
            >
              <span>Pro</span>
            </Stack>
          </Link>
        </TextOnlyTooltip>
      )}
      {userRole === 'elite' && (
        <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
          <Link
            href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
            target={'_blank'}
            underline={'none'}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              component={'div'}
              sx={{
                borderRadius: '4px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(178, 115, 255, 0.16)'
                    : 'rgba(118, 1, 211, 0.08)',
                fontSize: '12px',
                fontWeight: 700,
                py: '2px',
                px: '4px',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(178, 115, 255, 0.24)'
                      : 'rgba(118, 1, 211, 0.12)',
                },
              }}
            >
              <span>Elite</span>
            </Stack>
          </Link>
        </TextOnlyTooltip>
      )}
      {userRole === 'basic' && (
        <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
          <Link
            href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
            target={'_blank'}
            underline={'none'}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              component={'div'}
              sx={{
                borderRadius: '4px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(178, 115, 255, 0.16)'
                    : 'rgba(118, 1, 211, 0.08)',
                fontSize: '12px',
                fontWeight: 700,
                py: '2px',
                px: '4px',
                color: 'text.primary',
                '&:hover': {
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(178, 115, 255, 0.24)'
                      : 'rgba(118, 1, 211, 0.12)',
                },
              }}
            >
              <span>Basic</span>
            </Stack>
          </Link>
        </TextOnlyTooltip>
      )}
      {isFreeUser && (
        <Link
          href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            component={'div'}
            sx={{
              borderRadius: '4px',
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(178, 115, 255, 0.16)'
                  : 'rgba(118, 1, 211, 0.08)',
              fontSize: '12px',
              fontWeight: 700,
              py: '2px',
              px: '4px',
              color: 'text.primary',
              '&:hover': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(178, 115, 255, 0.24)'
                    : 'rgba(118, 1, 211, 0.12)',
              },
            }}
          >
            <span>{t('client:sidebar__top_bar__upgrade__title')}</span>
          </Stack>
        </Link>
      )}
      {isFreeUser && (
        <Link
          href={`${APP_USE_CHAT_GPT_HOST}/rewards`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            component={'div'}
            sx={{
              cursor: 'pointer',
              borderRadius: '99px',
              border: '1px solid',
              borderColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(178, 115, 255, 0.16)',
              fontSize: '12px',
              fontWeight: 600,
              py: '6px',
              px: '8px',
              color: 'text.primary',
              gap: '2px',
              '&:hover': {
                backgroundColor: 'rgba(178, 115, 255, 0.08)',
                borderColor: '#B273FF',
              },
            }}
          >
            <GiftIcon sx={{ fontSize: '14px' }} />
            <span>{t('client:sidebar__top_bar__rewards__title')}</span>
          </Stack>
        </Link>
      )}
    </LoginLayout>
  )
}
export default AuthUserRoleIconDropdown
