import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Popper, { PopperPlacementType } from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IPayingUserUpgradePopperProps {
  renderPlan: RENDER_PLAN_TYPE
  childrenBoxSx?: SxProps
  sx?: SxProps
  popperPaperSx?: SxProps
  children: React.ReactNode
  placement?: PopperPlacementType
}

const PayingUserUpgradePopper: FC<IPayingUserUpgradePopperProps> = ({
  renderPlan,
  sx,
  childrenBoxSx,
  popperPaperSx,
  children,
  placement: propPlacement,
}) => {
  const { t } = useTranslation()

  // const navigate = useNavigate();

  const { planPricingInfo } = usePlanPricingInfo()
  const planPricing = planPricingInfo[renderPlan]

  const anchorElRef = React.useRef<HTMLButtonElement>(null)

  const [popperOpen, setPopperOpen] = React.useState(false)

  const { isTopPlanUser } = useUserInfo()

  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()

  const placement = useMemo(() => {
    if (propPlacement) {
      return propPlacement
    } else {
      return isInImmersiveChatPage ? 'right' : 'left'
    }
  }, [propPlacement, isInImmersiveChatPage])

  const handlePopoverOpen = () => {
    setPopperOpen(true)
  }

  const handlePopoverClose = () => {
    setPopperOpen(false)
  }

  const handleClickUpgrade = () => {
    const paymentType = renderPlan.includes('yearly') ? 'yearly' : 'monthly'
    window.open(
      `${APP_USE_CHAT_GPT_HOST}/pricing?autoClickPlan=${renderPlan}&paymentType=${paymentType}`,
      '_blank',
    )
  }

  if (isTopPlanUser) {
    return null
  }

  return (
    <Box position={'relative'} sx={sx}>
      <Box
        ref={anchorElRef}
        onClick={handleClickUpgrade}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        sx={childrenBoxSx}
      >
        {children}
      </Box>

      <Popper
        open={popperOpen}
        anchorEl={anchorElRef.current}
        placement={placement}
        onClick={(event) => {
          event.stopPropagation()
        }}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        transition
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: 'right top',
            }}
          >
            <Paper
              sx={{
                borderRadius: 2,
                border: '1px solid #EBEBEB',
                boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
                width: 360,
                p: 2,

                boxSizing: 'border-box',
                ...popperPaperSx,
              }}
            >
              <Stack spacing={2}>
                <Typography variant='custom' fontSize={18} fontWeight={600}>
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
                    bgcolor: (t) =>
                      t.palette.mode === 'dark' ? '#021108' : '#E7FDF1',
                    color: `#007852`,
                    boxSizing: 'border-box',
                    mt: '8px !important',
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
                    {t(
                      'client:pricing__plan_features__popular_discount__title',
                      {
                        RATIO: planPricing.discount_title,
                      },
                    )}
                  </Typography>
                </Stack>

                <Divider />

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

                <Box position='relative'>
                  <Button
                    variant='contained'
                    fullWidth
                    startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
                    sx={{
                      fontSize: 16,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                    onClick={handleClickUpgrade}
                  >
                    {t('client:permission__pricing_hook__button__upgrade_now')}
                  </Button>

                  <Box textAlign='center' mt={0.5}>
                    <Link
                      href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
                      target={'_blank'}
                      underline='none'
                    >
                      <Typography
                        variant='custom'
                        fontSize={12}
                        color='text.secondary'
                      >
                        {t('client:permission__pricing_modal__footer__title')}
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}

export default PayingUserUpgradePopper
