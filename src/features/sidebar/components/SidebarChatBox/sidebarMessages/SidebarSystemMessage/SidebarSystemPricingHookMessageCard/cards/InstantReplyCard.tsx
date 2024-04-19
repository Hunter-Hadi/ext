import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import ProLink from '@/features/common/components/ProLink'
import useVideoPopupController from '@/features/video_popup/hooks/useVideoPopupController'

interface IProps {
  ctaButtonClick?: () => void
  videoUrl?: string
}

const InstantReplyCard: FC<IProps> = ({ ctaButtonClick, videoUrl }) => {
  const { t } = useTranslation()
  const { openVideoPopup } = useVideoPopupController()

  return (
    <Stack spacing={1.5}>
      <Stack direction={'row'} alignItems="center" spacing={1}>
        <AutoAwesomeIcon
          sx={{
            color: 'primary.main',
          }}
        />
        <Typography fontSize={20} fontWeight={700} lineHeight={1.4}>
          {t('client:permission__pricing_hook__instant_reply__title')}
        </Typography>
      </Stack>
      <Typography fontSize={14} lineHeight={1.5}>
        {t('client:permission__pricing_hook__instant_reply__description')}
      </Typography>

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
        {videoUrl && (
          <Button
            size="small"
            startIcon={<PlayCircleFilledWhiteOutlinedIcon />}
            onClick={() => {
              openVideoPopup(videoUrl)
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
              px: 2,
              py: '2px',
              bgcolor: 'rgb(246 246 246)',
              boxShadow: '0px 0px 5px #8a8a8a',
            }}
          >
            {t('common:watch_video')}
          </Button>
        )}
        <Typography
          fontSize={20}
          lineHeight={1.4}
          fontWeight={700}
          color="primary.main"
        >
          {t(
            'client:permission__pricing_hook__instant_reply__more_content_card__title',
          )}
        </Typography>
        <Box
          sx={{
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(158, 119, 237, 0) 0%, rgba(158, 119, 237, 0.6) 50.19%, rgba(158, 119, 237, 0) 100%)',
          }}
        />
        {/* item 1 */}
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
                'client:permission__pricing_hook__instant_reply__more_content_card__item1__title',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              {t(
                'client:permission__pricing_hook__instant_reply__more_content_card__item1__description',
              )}
            </Typography>
          </Stack>
        </Stack>
        {/* item 2 */}
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
                'client:permission__pricing_hook__instant_reply__more_content_card__item2__title',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              {t(
                'client:permission__pricing_hook__instant_reply__more_content_card__item2__description',
              )}
            </Typography>
          </Stack>
        </Stack>
        {/* item 3 */}
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
                'client:permission__pricing_hook__instant_reply__more_content_card__item3__title',
              )}
            </Typography>
            <Typography fontSize={14} lineHeight={1.5} color="#00000099">
              {t(
                'client:permission__pricing_hook__instant_reply__more_content_card__item3__description',
              )}
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

export default InstantReplyCard
