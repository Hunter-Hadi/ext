import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import PermissionDailyLimitBar from '@/features/auth/components/PermissionDailyLimitBar'
import useActivity from '@/features/auth/hooks/useActivity'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import UnableAutoSubscriptionBar from "@/features/subscription/components/UnableAutoSubscriptionBar";

const SidebarTopBar: FC = () => {
  const { t } = useTranslation(['client'])
  const { currentUserPlan } = useUserInfo()
  const {
    isShowActivityBanner,
    isAbleToCloseActivityBanner,
    handleCloseActivityBanner,
  } = useActivity()
  return (
    <Stack>
      {/* 无法自动订阅提示 */}
      <UnableAutoSubscriptionBar />

      {/* free用户daily limit提示 */}
      <PermissionDailyLimitBar />

      {/*黑五*/}
      {/*deprecated*/}
      {isShowActivityBanner && false && (
        <Link
          href={`https://app.maxai.me/blackfriday2023`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            py={1}
            alignItems={'center'}
            justifyContent={'center'}
            sx={{
              height: '48px',
              bgcolor: '#000',
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                fontSize: '16px',
                background:
                  'linear-gradient(180deg, #FFF069 20.63%, #FFF1BF 49.34%, #FFA915 81.89%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                lineHeight: '24px',
              }}
            >
              {t('client:activity__black_friday_2023__title')}
            </Typography>
            {isAbleToCloseActivityBanner && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: '8px',
                  top: '4px',
                }}
                onClick={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  await handleCloseActivityBanner()
                }}
              >
                <ContextMenuIcon
                  icon={'Close'}
                  sx={{
                    color: '#FFFFFF99',
                    fontSize: '24px',
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Link>
      )}
      {isShowActivityBanner && (
        <Link
          href={`https://app.maxai.me/pricing`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            py={1}
            alignItems={'center'}
            justifyContent={'center'}
            sx={{
              height: '48px',
              position: 'relative',
              backgroundColor: '#9065B0',
            }}
          >
            <Stack direction={'row'} alignItems={'baseline'} gap={0.5}>
              <Box
                component={'span'}
                sx={{
                  display: 'inline-block',
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 600,
                  borderRadius: 26,
                  border: '1px solid #FFF',
                  background: '#9065B0',
                  boxShadow: '0px 0px 0px 0px #FFD15C inset',
                  px: 0.8,
                  py: 0.2,
                  fontSize: '16px',
                }}
              >
                {t(`client:activity__1st_anniversary_2024__title1`)}
              </Box>
              <Typography
                component={'span'}
                sx={{
                  fontSize: '16px',
                  color: '#fff',
                  fontWeight: 700,
                  lineHeight: '16px',
                }}
              >
                {t('client:activity__1st_anniversary_2024__title2', {
                  PERCENT:
                    currentUserPlan.name === 'free' ||
                    currentUserPlan.name === 'new_user' ||
                    currentUserPlan.name === 'pro_gift'
                      ? '68'
                      : '54',
                })}
              </Typography>
            </Stack>
            {isAbleToCloseActivityBanner && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: '8px',
                  top: '4px',
                }}
                onClick={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  await handleCloseActivityBanner()
                }}
              >
                <ContextMenuIcon
                  icon={'Close'}
                  sx={{
                    color: '#FFFFFF99',
                    fontSize: '24px',
                    '&:hover': {
                      color: '#FFFFFF',
                    },
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Link>
      )}
    </Stack>
  )
}
export default SidebarTopBar
