import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ProLink from '@/features/common/components/ProLink'

interface IProps {
  ctaButtonClick?: () => void
}

const AdvancedModelCard: FC<IProps> = ({ ctaButtonClick }) => {
  const { t } = useTranslation()
  const { isPayingUser } = useUserInfo()

  return (
    <Stack spacing={1.5}>
      <Stack direction={'row'} alignItems="center" spacing={1}>
        <AutoAwesomeIcon
          sx={{
            color: 'primary.main',
          }}
        />
        <Typography fontSize={20} fontWeight={700} lineHeight={1.4}>
          {t('client:permission__pricing_hook__advanced_text_usage__title')}
        </Typography>
      </Stack>
      <Typography fontSize={14} lineHeight={1.5}>
        {t(
          isPayingUser
            ? 'client:permission__pricing_hook__advanced_text_usage__description__for_paying'
            : 'client:permission__pricing_hook__advanced_text_usage__description__for_free',
        )}
      </Typography>
      <Stack
        spacing={1.5}
        p={2.5}
        sx={{
          background: 'linear-gradient(315deg, #F5C8F5 0%, #DADDFA 83.85%)',
          borderRadius: 2,
        }}
      >
        <Typography
          fontSize={20}
          lineHeight={1.4}
          fontWeight={700}
          color="primary.main"
        >
          {t('client:permission__pricing_hook__ai_model_queries_card__title')}
        </Typography>
        <Box
          sx={{
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(158, 119, 237, 0) 0%, rgba(158, 119, 237, 0.6) 50.19%, rgba(158, 119, 237, 0) 100%)',
          }}
        />
        {/* fast text */}
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
              {t(
                'client:permission__pricing_hook__ai_model_queries_card__fast_text',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              GPT-3.5 & Claude-3-haiku & Gemini-pro
            </Typography>
          </Stack>
        </Stack>
        {/* advanced text */}
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
              {t(
                'client:permission__pricing_hook__ai_model_queries_card__advanced_text',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              GPT-4 & Claude-3-opus/sonnet & Gemini-1.5-pro
            </Typography>
          </Stack>
        </Stack>
        {/* image */}
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
              {t(
                'client:permission__pricing_hook__ai_model_queries_card__image_text',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              DALL·E 3
            </Typography>
          </Stack>
        </Stack>
        {/* premium features */}
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
                color: 'primary.main',
                fontSize: 14,
                width: 'max-content',
              }}
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {t('common:learn_more')}
            </ProLink>
          </Stack>
        </Stack>
      </Stack>

      {/* cta button */}
      <Stack spacing={0.5} mt={'16px !important'}>
        <Button
          fullWidth
          sx={{
            height: 48,
            fontSize: '16px',
            fontWeight: 500,
            // bgcolor: 'promotionColor.backgroundMain',
            // color: 'white',
            // '&:hover': {
            //   bgcolor: '#b56407',
            // },
          }}
          startIcon={<RocketLaunchIcon />}
          variant={'contained'}
          color={'primary'}
          target={'_blank'}
          href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
          onClick={ctaButtonClick}
        >
          {t('client:permission__pricing_hook__button__upgrade_now')}
        </Button>
        <Stack
          direction={'row'}
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
        >
          <CheckOutlinedIcon
            sx={{
              fontSize: 20,
              color: 'primary.main',
            }}
          />
          <Typography fontSize={14} color="text.secondary">
            {t('common:cancel_anytime')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default AdvancedModelCard
