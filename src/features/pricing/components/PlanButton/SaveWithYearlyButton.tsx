import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import { SxProps } from '@mui/material'
import { buttonClasses } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import {
  getYearlyPriceOfMonthlyPriceHowMuchSaveUpEachYear,
  transformRenderTypeToPlanType,
} from '@/features/pricing/utils'

export interface SaveWithYearlyButtonProps
  extends Omit<LoadingButtonProps, 'onClick'> {
  plan: RENDER_PLAN_TYPE
  sx?: SxProps
  onClick?: (targetPaymentPlan: RENDER_PLAN_TYPE) => Promise<void>
}

const SaveWithYearlyButton: FC<SaveWithYearlyButtonProps> = (props) => {
  const { plan, loading, disabled, onClick, sx, ...rest } = props

  const { t } = useTranslation(['common', 'client'])
  const { planPricingInfo } = usePlanPricingInfo()

  const priceText = getYearlyPriceOfMonthlyPriceHowMuchSaveUpEachYear(
    plan,
    planPricingInfo,
    true,
  )

  return (
    <LoadingButton
      variant='text'
      size='small'
      onClick={() => {
        const yearlyPlan = transformRenderTypeToPlanType(plan, 'yearly')
        onClick && onClick(yearlyPlan)
      }}
      endIcon={<ChevronRightOutlinedIcon />}
      disabled={disabled || loading}
      sx={{
        p: 0,
        fontSize: 14,
        lineHeight: 1.5,
        [`& .${buttonClasses.endIcon}`]: {
          ml: 0,
        },
        ...sx,
      }}
      {...rest}
    >
      {loading ? (
        <CircularProgress
          size={14}
          sx={{ mr: 0.6, color: 'rgba(0, 0, 0, 0.26)' }}
        />
      ) : null}
      {t('client:pricing__plan_features__save_with_yearly__title', {
        PRICE: `$${priceText}`,
      })}
    </LoadingButton>
  )
}

export default SaveWithYearlyButton
