import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { mixpanelTrack } from '@/features/mixpanel/utils'
import PayingUserUpgradeCard from '@/features/pricing/components/PayingUserUpgradeCard'
import SidebarSurveyContent from '@/features/sidebar/components/SidebarChatBox/SidebarSurveyDialog/SidebarSurveyContent'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const RewardsTabTooltip = () => {
  const { t } = useTranslation(['common', 'client'])

  return (
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
        src={getChromeExtensionAssetsURL(`/images/activity/rewards-bg.png`)}
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
          {t('client:sidebar__marketing_tabs__rewards__card__button__title')}
        </Typography>
      </Button>
    </Link>
  )
}

export const AffiliateTabTooltip = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
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
        src={getChromeExtensionAssetsURL(`/images/activity/affiliate-bg.png`)}
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
          {t('client:sidebar__marketing_tabs__affiliate__card__button__title')}
        </Typography>
      </Button>
    </Link>
  )
}

export const SurveyTabTooltip = () => {
  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        maxWidth: '360px',
      }}
    >
      <SidebarSurveyContent surveyKey={'feedback'} closeBtn={false} />
    </Stack>
  )
}

export const UpgradePlanTooltip = () => {
  return <PayingUserUpgradeCard renderPlan='elite_yearly' />
}
