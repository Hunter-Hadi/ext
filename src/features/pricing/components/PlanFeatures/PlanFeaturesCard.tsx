import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import { Box, SxProps } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import capitalize from 'lodash-es/capitalize'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import PlanButton from '@/features/pricing/components/PlanButton'
import TooltipIcon from '@/features/pricing/components/PlanFeatures/TooltipIcon'
import PlanProductivityValue from '@/features/pricing/components/PlanProductivityValue'
import { PLAN_FEATURES_MAP } from '@/features/pricing/constants'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import {
  getTargetPlanDiscountedPrice,
  renderTypeToName,
  transformRenderTypeToPlanType,
} from '@/features/pricing/utils'
import { truncateToDecimalPlaces } from '@/utils/dataHelper/numberHelper'

export interface PlanFeaturesCardProps {
  plan: RENDER_PLAN_TYPE
  isPopular?: boolean
  onUpgradeClick?: (plan: RENDER_PLAN_TYPE) => void
  sx?: SxProps
}

const BlackTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: '#fff',
    width: '320px',
    padding: theme.spacing(1.5),
    fontSize: '14px',
    lineHeight: '1.5',
    boxSizing: 'border-box',
    boxShadow: theme.shadows[5],
    maxWidth: 'unset',
    borderRadius: '8px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
}))

const PlanFeaturesCard: FC<PlanFeaturesCardProps> = (props) => {
  const { plan, onUpgradeClick, isPopular, sx } = props

  const { t } = useTranslation(['common', 'client'])
  const { planPricingInfo } = usePlanPricingInfo()
  const { currentUserPlan } = useUserInfo()

  const planPricing = planPricingInfo[plan]

  const isYearly = plan.includes('yearly')

  const isCurrentPlan = useMemo(() => {
    if (currentUserPlan?.name.includes('elite')) {
      return true
    }
    if (currentUserPlan?.name.includes('pro') && plan.includes('pro')) {
      return true
    }
    return false
  }, [currentUserPlan?.name, plan])

  const priceText = useMemo(() => {
    const price = getTargetPlanDiscountedPrice(planPricing)
    return truncateToDecimalPlaces(price / (isYearly ? 12 : 1), 2)
  }, [isYearly, planPricing])

  const formatPlan = capitalize(renderTypeToName(plan))

  const planFeatures = plan.includes('elite')
    ? PLAN_FEATURES_MAP.elite
    : plan.includes('pro')
    ? PLAN_FEATURES_MAP.pro
    : null

  const sendLog = async () => {
    onUpgradeClick && onUpgradeClick(plan)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        border: '1px solid',
        borderRadius: 2,
        borderColor: isPopular ? 'primary.main' : 'divider',
        bgcolor: isPopular ? 'rgba(249, 245, 255, 1)' : 'rgba(255,255,255,1)',
        overflow: 'hidden',
        boxShadow: '0px 4px 6px -2px #10182808',
        mt: isPopular ? 0 : '40px !important',
        ...sx,
      }}
    >
      {/* popular flag */}
      {isPopular && (
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='center'
          bgcolor='rgba(243, 230, 255, 1)'
          spacing={0.5}
          height={40}
        >
          <AutoAwesomeIcon
            sx={{
              color: 'primary.main',
              fontSize: 18,
            }}
          />
          <Typography
            variant='custom'
            fontSize={16}
            lineHeight={1.5}
            color='primary.main'
          >
            {t('client:pricing__plan_features__most_popular__title')}
          </Typography>
        </Stack>
      )}

      {/* payment info */}
      <Stack p={2}>
        <Stack direction='row' spacing={1}>
          {/* plan title */}
          <Typography
            variant='custom'
            fontSize={20}
            fontWeight={700}
            color={'primary.main'}
          >
            MaxAI {formatPlan}
          </Typography>

          {/* plan discount */}
          {planPricing.discount_title ? (
            <Stack
              direction='row'
              spacing={0.5}
              px={1}
              alignItems='center'
              sx={{
                borderRadius: '14px',
                bgcolor: isPopular ? '#FF8800' : 'rgba(249, 245, 255, 1)',
                color: isPopular ? '#fff' : 'primary.main',
              }}
            >
              {isPopular && (
                <ElectricBoltIcon sx={{ color: 'inherit', fontSize: 16 }} />
              )}
              <Typography color='inherit' fontSize={14} fontWeight={500}>
                {t(
                  isPopular
                    ? 'client:pricing__plan_features__popular_discount__title'
                    : 'client:pricing__plan_features__discount__title',
                  {
                    RATIO: planPricing.discount_title,
                  },
                )}
              </Typography>
            </Stack>
          ) : null}
        </Stack>

        {/* plan productivity */}
        <PlanProductivityValue renderType={plan} sx={{ mt: 1 }} />

        {/* plan price */}
        <Stack direction='row' alignItems='center' spacing={1} mt={1.5}>
          {/* 这里比较特殊，需要一直显示 month 价格 */}
          {isYearly ? (
            <>
              <Typography
                fontSize={24}
                fontWeight={700}
                color='rgb(154, 152, 158)'
                sx={{
                  textDecoration: 'line-through',
                }}
              >
                $
                {
                  planPricingInfo[
                    transformRenderTypeToPlanType(plan, 'monthly')
                  ].price
                }
              </Typography>
              <Typography
                fontSize={40}
                fontWeight={700}
                color='rgba(0, 0, 0, 0.87)'
              >
                ${priceText}
              </Typography>
              <Typography fontSize={14} color='rgba(0, 0, 0, 0.6)'>
                {t('client:pricing__plan_features__monthly_price__desc')}
                <br />
                {t('client:pricing__plan_features__yearly_price__desc')}
              </Typography>
            </>
          ) : (
            <>
              <Typography
                fontSize={40}
                fontWeight={700}
                color='rgba(0, 0, 0, 0.87)'
              >
                ${planPricing.price}
              </Typography>
              <Typography fontSize={14} color='rgba(0, 0, 0, 0.6)'>
                {t('client:pricing__plan_features__monthly_price__desc')}
              </Typography>
            </>
          )}
        </Stack>

        <Typography fontSize={16} color='rgba(0, 0, 0, 0.6)'>
          {planFeatures?.description(t) || ' '}
        </Typography>

        {/* plan button */}
        <Stack
          spacing={1}
          mt={2}
          visibility={isCurrentPlan ? 'hidden' : 'visible'}
        >
          <PlanButton
            renderType={plan}
            variant={isPopular || isCurrentPlan ? 'contained' : 'outlined'}
            fullWidth
            sx={{
              fontSize: 16,
              px: 2,
              py: 1.5,
              borderRadius: 2,
            }}
            disabled={isCurrentPlan}
            sendLog={sendLog}
            moreContent
          >
            {isCurrentPlan
              ? t('client:pricing__plan_features__current_plan__title')
              : t('client:pricing__plan_features__cta_button__title', {
                  PLAN: formatPlan,
                })}
          </PlanButton>
        </Stack>
      </Stack>

      <Divider />

      {/* plan features */}
      {planFeatures && (
        <Stack p={2} spacing={2}>
          {planFeatures.features(t).map((feature, featureIndex) => (
            <>
              <Typography
                fontSize={16}
                fontWeight={600}
                color='rgba(0, 0, 0, 0.87)'
              >
                {feature.title}
              </Typography>
              {feature.items.map((item, itemIndex) => (
                <Stack
                  key={itemIndex}
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  visibility={
                    item.title || item.subtitle ? 'visible' : 'hidden'
                  }
                >
                  <CheckCircleOutlineIcon
                    sx={{ color: 'rgba(0, 0, 0, 0.87)', fontSize: 20 }}
                  />
                  <Box>
                    <Typography fontSize={14} color='rgba(0, 0, 0, 0.87)'>
                      {item.title}
                    </Typography>
                    {item.subtitle && (
                      <Typography
                        position='absolute'
                        mt={0.5}
                        fontSize={12}
                        color='rgba(0, 0, 0, 0.5)'
                      >
                        {item.subtitle}
                      </Typography>
                    )}
                  </Box>
                  {item.tooltip && (
                    <BlackTooltip
                      PopperProps={{
                        sx: {
                          zIndex: 2147483621,
                        },
                      }}
                      title={
                        <Box>
                          <Typography
                            fontSize={14}
                            color='#fff'
                            whiteSpace='pre-wrap'
                          >
                            {item.tooltip}
                          </Typography>
                        </Box>
                      }
                      placement='top'
                      arrow
                    >
                      <Box height={20}>
                        <TooltipIcon />
                      </Box>
                    </BlackTooltip>
                  )}
                </Stack>
              ))}
            </>
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default PlanFeaturesCard
