import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

interface IUpgradePlanSalesCardProps {
  renderPlan: RENDER_PLAN_TYPE
}

const UpgradePlanSalesCard: FC<IUpgradePlanSalesCardProps> = ({
  renderPlan,
}) => {
  const { t } = useTranslation()

  const { planPricingInfo } = usePlanPricingInfo()
  const planPricing = planPricingInfo[renderPlan]

  const handleClickUpgrade = () => {
    window.open(
      `${APP_USE_CHAT_GPT_HOST}/pricing?autoClickPlan=${renderPlan}`,
      '_blank',
    )
  }

  return (
    <Stack
      borderRadius={2}
      border={'1px solid'}
      borderColor='customColor.borderColor'
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? '#2C2C2C' : '#FFFFFF',
      }}
    >
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        alignItems={{
          xs: 'flex-start',
          sm: 'center',
        }}
        p={2}
        spacing={1}
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? '#FFFFFF14' : '#0000000A',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography
          variant='custom'
          fontSize={16}
          fontWeight={700}
          lineHeight={1.2}
        >
          {t('client:pricing__upgrade__popper_card__title')}
        </Typography>
        <Stack
          direction={'row'}
          alignItems='center'
          justifyContent='space-between'
          spacing={0.5}
          sx={{
            width: 'max-content',
            borderRadius: 2,
            px: 1,
            py: 0.4,
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#021108' : '#E7FDF1'),
            color: `#007852`,
            boxSizing: 'border-box',
          }}
        >
          <ElectricBoltIcon
            sx={{
              fontSize: 24,
              color: '#FFCB45',
            }}
          />
          <Typography
            variant='custom'
            fontSize={16}
            lineHeight={1.5}
            fontWeight={600}
            color={'#007852'}
          >
            {t('client:pricing__plan_features__popular_discount__title', {
              RATIO: planPricing.discount_title,
            })}
          </Typography>
        </Stack>
      </Stack>
      <Box px={3} py={2}>
        <Grid
          container
          spacing={2}
          alignItems={'center'}
          justifyContent='space-between'
        >
          <Grid item xs={12} sm={6}>
            <Stack spacing={1.5}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <CheckCircleOutlineIcon
                  sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
                />
                <Typography fontSize={16} variant='custom'>
                  {t('client:pricing__upgrade__popper_card__item1__title')}
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1} alignItems='center'>
                <CheckCircleOutlineIcon
                  sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
                />
                <Typography fontSize={16} variant='custom'>
                  {t('client:pricing__upgrade__popper_card__item2__title')}
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1} alignItems='center'>
                <CheckCircleOutlineIcon
                  sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
                />
                <Typography fontSize={16} variant='custom'>
                  {t('client:pricing__upgrade__popper_card__item3__title')}
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1} alignItems='center'>
                <CheckCircleOutlineIcon
                  sx={{ color: 'rgba(0, 170, 61, 1)', fontSize: 24 }}
                />
                <Typography fontSize={16} variant='custom'>
                  {t('client:pricing__upgrade__popper_card__item4__title')}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <Stack>
              <Button
                variant='contained'
                fullWidth
                startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
                sx={{
                  fontSize: 16,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  minWidth: 200,
                }}
                onClick={handleClickUpgrade}
              >
                {t('client:permission__pricing_hook__button__upgrade_now')}
              </Button>
              <Box textAlign='center' mt={0.5}>
                <Link href={'/pricing'} underline='none'>
                  <Typography
                    variant='custom'
                    fontSize={12}
                    color='text.secondary'
                  >
                    {t('client:permission__pricing_modal__footer__title')}
                  </Typography>
                </Link>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  )
}

export default UpgradePlanSalesCard
