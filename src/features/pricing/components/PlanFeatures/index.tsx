import { Stack, SxProps } from '@mui/material'
import React, { FC, useState } from 'react'

import PaymentTypeSwitch from '@/features/pricing/components/PaymentTypeSwitch'
import PlanFeaturesCard from '@/features/pricing/components/PlanFeatures/PlanFeaturesCard'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { IPaymentType, RENDER_PLAN_TYPE } from '@/features/pricing/type'

export interface PlanFeaturesProps {
  onUpgradeClick?: (plan: RENDER_PLAN_TYPE) => void
  sx?: SxProps
}

const PlanFeatures: FC<PlanFeaturesProps> = (props) => {
  const { onUpgradeClick, sx } = props
  const [paymentType, setPaymentType] = useState<IPaymentType>('yearly')

  usePlanPricingInfo(true)

  return (
    <Stack sx={sx} spacing={3} minWidth={700}>
      <PaymentTypeSwitch
        value={paymentType}
        onChange={setPaymentType}
        sx={{ mx: 'auto !important' }}
      />
      <Stack direction='row' spacing={2}>
        <PlanFeaturesCard
          plan={paymentType === 'yearly' ? 'elite_yearly' : 'elite'}
          onUpgradeClick={onUpgradeClick}
          isPopular
        />
        <PlanFeaturesCard
          plan={paymentType === 'yearly' ? 'pro_yearly' : 'pro'}
          onUpgradeClick={onUpgradeClick}
        />
      </Stack>
    </Stack>
  )
}

export default PlanFeatures
