import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import {
  IPermissionPricingHookCardType,
  PREMIUM_ACCESS_CARD_SETTINGS_MAP,
} from '@/features/auth/components/PermissionPricingHookCard/types'
import ProLink from '@/features/common/components/ProLink'
import useVideoPopupController from '@/features/video_popup/hooks/useVideoPopupController'

interface IPermissionPricingHookCardProps {
  videoUrl?: string
  pricingHookCardType: IPermissionPricingHookCardType
}

const PremiumAccessCard: FC<IPermissionPricingHookCardProps> = ({
  videoUrl,
  pricingHookCardType,
}) => {
  const { t } = useTranslation()
  const { openVideoPopup } = useVideoPopupController()

  const premiumAccessCardData =
    PREMIUM_ACCESS_CARD_SETTINGS_MAP[pricingHookCardType]

  return (
    <Stack
      spacing={1.5}
      p={2.5}
      sx={{
        background: 'linear-gradient(315deg, #F5C8F5 0%, #DADDFA 83.85%)',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {videoUrl ? (
        <Button
          size="small"
          startIcon={<PlayCircleFilledWhiteOutlinedIcon />}
          onClick={() => {
            videoUrl && openVideoPopup(videoUrl)
          }}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 'max-content',
            color: 'primary.main',
            borderRadius: 0,
            borderBottomLeftRadius: 8,
            borderTopRightRadius: 8,
            px: 1.5,
            py: '2px',
            bgcolor: '#fff',
            boxShadow: '0px 0px 5px #8a8a8a',
          }}
        >
          {t('common:watch_video')}
        </Button>
      ) : null}
      <Typography
        fontSize={20}
        lineHeight={1.4}
        fontWeight={700}
        color="primary.main"
        mt={'0px !important'}
      >
        {t(premiumAccessCardData.title)}
      </Typography>
      <Box
        sx={{
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(158, 119, 237, 0) 0%, rgba(158, 119, 237, 0.6) 50.19%, rgba(158, 119, 237, 0) 100%)',
        }}
      />
      {premiumAccessCardData.accessItems.map((accessItem) => (
        <Stack key={accessItem.featuresTitle} direction={'row'} spacing={1.5}>
          <CheckCircleOutlineOutlinedIcon
            sx={{
              color: '#27282E',
            }}
          />
          <Stack>
            <Typography
              fontSize={16}
              lineHeight={1.5}
              fontWeight={500}
              color="#000000DE"
            >
              {t(accessItem.featuresTitle)}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              {t(accessItem.featuresDescription)}
            </Typography>
          </Stack>
        </Stack>
      ))}

      {/* premium features */}
      {premiumAccessCardData.learnMore ? (
        <Stack direction={'row'} spacing={1.5}>
          <CheckCircleOutlineOutlinedIcon
            sx={{
              color: '#27282E',
            }}
          />
          <Stack>
            <Typography
              fontSize={16}
              lineHeight={1.5}
              fontWeight={500}
              color="#000000DE"
            >
              {t('client:permission__pricing_hook__premium_features')}
            </Typography>
            <ProLink
              href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
              underline="always"
              sx={{
                width: 'max-content',
                color: 'primary.main',
                fontSize: 14,
              }}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {t('common:learn_more')}
            </ProLink>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  )
}

export default PremiumAccessCard
