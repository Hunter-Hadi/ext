import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { GiftIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useAuthLogin } from '@/features/auth'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import SidebarSurveyContent from '@/features/sidebar/components/SidebarChatBox/SidebarSurveyDialog/SidebarSurveyContent'
import useFeedbackSurveyStatus from '@/features/survey/hooks/useFeedbackSurveyStatus'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: `transparent`,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    padding: 0,
    boxShadow: `0px 12px 16px -4px rgba(0, 0, 0, 0.16), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)`,
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

const RewardsTabButton: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()
  return (
    <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
      <LightTooltip
        onOpen={() => {
          mixpanelTrack(`referral_card_showed`, {
            referralType: 'REWARDS',
          })
        }}
        PopperProps={{
          disablePortal: true,
        }}
        placement='left'
        title={
          <Link
            underline={'none'}
            target={'_blank'}
            href={'https://app.maxai.me/rewards'}
            position={'relative'}
            width={360}
            height={218}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'end',
              p: 1,
            }}
            onClick={() => {
              mixpanelTrack(`referral_card_clicked`, {
                referralType: 'REWARDS',
              })
            }}
          >
            <img
              src={getChromeExtensionAssetsURL(
                `/images/activity/rewards-bg.png`,
              )}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -1,
              }}
              alt={'rewards-bg'}
            />
            <Button
              sx={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 1,
                border: '1px solid #000',
                bgcolor: '#000',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                '&:hover': {
                  bgcolor: '#000',
                  color: '#fff',
                },
              }}
              endIcon={
                <CallMadeOutlinedIcon color={'inherit'} fontSize={'inherit'} />
              }
            >
              <Typography color={'inherit'} fontSize={'inherit'}>
                {t(
                  'client:sidebar__marketing_tabs__rewards__card__button__title',
                )}
              </Typography>
            </Button>
          </Link>
        }
      >
        <Button
          data-testid={`maxai--sidebar--rewards_tab`}
          target={'_blank'}
          href={'https://app.maxai.me/rewards'}
          onClick={() => {
            mixpanelTrack(`referral_card_clicked`, {
              referralType: 'REWARDS',
            })
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 'unset',
            width: '100%',
            color: 'text.secondary',
            py: 0.5,
            position: 'relative',
            borderRadius: 2,
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(44, 44, 44, 1)'
                  : 'rgba(144, 101, 176, 0.16)',
              color: 'primary.main',
            },
          }}
        >
          <GiftIcon />
          <Typography
            fontSize={12}
            color={'inherit'}
            data-testid={`max-ai__rewards-tab`}
            lineHeight={1}
          >
            {t('client:sidebar__marketing_tabs__rewards__tab__title')}
          </Typography>
        </Button>
      </LightTooltip>
    </Box>
  )
}

const AffiliateTabButton: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()
  return (
    <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
      <LightTooltip
        onOpen={() => {
          mixpanelTrack(`referral_card_showed`, {
            referralType: 'AFFILIATE',
          })
        }}
        PopperProps={{
          disablePortal: true,
        }}
        placement='left'
        title={
          <Link
            underline={'none'}
            target={'_blank'}
            href={'https://www.maxai.me/affiliate'}
            position={'relative'}
            width={360}
            height={218}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 1,
            }}
            onClick={() => {
              mixpanelTrack(`referral_card_clicked`, {
                referralType: 'AFFILIATE',
              })
            }}
          >
            <img
              src={getChromeExtensionAssetsURL(
                `/images/activity/affiliate-bg.png`,
              )}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -1,
              }}
              alt={'rewards-bg'}
            />
            <Stack width={'100%'} my={'auto'}>
              <Typography
                fontSize={'20px'}
                fontWeight={700}
                lineHeight={1.4}
                color={'#fff'}
                textAlign={'center'}
                whiteSpace={'pre-line'}
              >
                {t(`client:sidebar__marketing_tabs__affiliate__card__title`)}
              </Typography>
              <Typography
                fontSize={'14px'}
                fontWeight={400}
                lineHeight={1.5}
                color={'#fff'}
                textAlign={'center'}
              >
                {t(
                  `client:sidebar__marketing_tabs__affiliate__card__description__part_1`,
                )}
                <Typography
                  component={'b'}
                  sx={{
                    color: '#000',
                    bgcolor: '#ffca16',
                    fontSize: '16px',
                    fontWeight: 600,
                    p: '2px 4px',
                    ml: '2px',
                    borderRadius: '6px',
                  }}
                >
                  {`25%`}
                </Typography>
              </Typography>
              <Typography
                fontSize={'14px'}
                fontWeight={400}
                lineHeight={1.5}
                color={'#fff'}
                textAlign={'center'}
              >
                {t(
                  `client:sidebar__marketing_tabs__affiliate__card__description__part_2`,
                )}
              </Typography>
            </Stack>
            <Button
              sx={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 1,
                border: '1px solid #000',
                bgcolor: '#000',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                textAlign: 'center',
                '&:hover': {
                  bgcolor: '#000',
                  color: '#fff',
                },
              }}
              endIcon={
                <CallMadeOutlinedIcon color={'inherit'} fontSize={'inherit'} />
              }
            >
              <Typography color={'inherit'} fontSize={'inherit'}>
                {t(
                  'client:sidebar__marketing_tabs__affiliate__card__button__title',
                )}
              </Typography>
            </Button>
          </Link>
        }
      >
        <Button
          data-testid={`maxai--sidebar--rewards_tab`}
          target={'_blank'}
          href={'https://www.maxai.me/affiliate'}
          onClick={() => {
            mixpanelTrack(`referral_card_clicked`, {
              referralType: 'AFFILIATE',
            })
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 'unset',
            width: '100%',
            color: 'text.secondary',
            py: 0.5,
            position: 'relative',
            borderRadius: 2,
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(44, 44, 44, 1)'
                  : 'rgba(144, 101, 176, 0.16)',
              color: 'primary.main',
            },
          }}
        >
          <GiftIcon />
          <Typography
            fontSize={12}
            color={'inherit'}
            data-testid={`max-ai__survey_tab`}
            lineHeight={1}
          >
            {t('client:sidebar__marketing_tabs__affiliate__tab__title')}
          </Typography>
        </Button>
      </LightTooltip>
    </Box>
  )
}
const SurveyTabButton: FC = () => {
  const { t } = useTranslation(['common', 'client'])

  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()
  return (
    <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
      <LightTooltip
        PopperProps={{
          disablePortal: true,
        }}
        placement='left'
        title={
          <Stack
            sx={{
              bgcolor: 'background.paper',
              maxWidth: '360px',
            }}
          >
            <SidebarSurveyContent surveyKey={'feedback'} closeBtn={false} />
          </Stack>
        }
      >
        <Button
          data-testid={`maxai--sidebar--survey_tab`}
          target={'_blank'}
          href={`${APP_USE_CHAT_GPT_HOST}/survey/feedback`}
          onClick={() => {
            mixpanelTrack('survey_card_clicked', {
              surveyType: 'feedback',
            })
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 'unset',
            width: '100%',
            color: 'text.secondary',
            py: 0.5,
            position: 'relative',
            borderRadius: 2,
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(44, 44, 44, 1)'
                  : 'rgba(144, 101, 176, 0.16)',
              color: 'primary.main',
            },
          }}
        >
          <FavoriteIcon />
          <Typography
            fontSize={12}
            color={'inherit'}
            data-testid={`max-ai__rewards-tab`}
            lineHeight={1}
          >
            {t('client:sidebar__marketing_tabs__survey__tab__title')}
          </Typography>
        </Button>
      </LightTooltip>
    </Box>
  )
}

/**
 * SidebarMarketingTabs - 营销标签页
 * @constructor
 */
const SidebarMarketingTabs: FC = () => {
  const { isLogin, loaded } = useAuthLogin()
  const { isFreeUser } = useUserInfo()
  const { canShowSurvey } = useFeedbackSurveyStatus()
  if (!isLogin || !loaded) {
    return null
  }
  return (
    <Stack
      data-testid={'maxAISidebarMarketingTabsContainer'}
      alignItems={'center'}
      width={'100%'}
      spacing={2}
    >
      {isFreeUser && <RewardsTabButton />}
      {!isFreeUser && <AffiliateTabButton />}
      {canShowSurvey && <SurveyTabButton />}
    </Stack>
  )
}
export { SidebarMarketingTabs }
