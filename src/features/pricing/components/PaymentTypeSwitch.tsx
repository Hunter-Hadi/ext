import { Stack, SxProps, Typography } from '@mui/material'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { IPaymentType } from '@/features/pricing/type'
import { I18nextKeysType } from '@/i18next'

const PAYMENT_TYPES: { label: I18nextKeysType; value: IPaymentType }[] = [
  {
    label: 'client:pricing__payment_type_switch__yearly__title',
    value: 'yearly',
  },
  {
    label: 'client:pricing__payment_type_switch__monthly__title',
    value: 'monthly',
  },
]

interface IProps {
  value: IPaymentType
  onChange?: (newValue: IPaymentType) => void
  sx?: SxProps
}

const PaymentTypeSwitch: FC<IProps> = (props) => {
  const { value, onChange, sx } = props
  const { t } = useTranslation()

  const { maxYearlyDiscount, maxMonthlyDiscount } = usePlanPricingInfo()

  const renderTip = (discountTitle: string) => {
    return (
      <Typography
        flexShrink={0}
        component={'span'}
        variant={'custom'}
        sx={{
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #F80',
          bgcolor: '#FF8800',
          padding: '2px 10px',
          color: 'white',
        }}
      >
        {t('client:pricing__payment_type_switch__title__tip', {
          RATIO: discountTitle,
        })}
      </Typography>
    )
  }

  return (
    <Stack
      direction='row'
      borderRadius={10}
      alignItems='center'
      width='max-content'
      border='1px solid'
      borderColor='primary.main'
      position='relative'
      mx='auto'
      sx={sx}
    >
      {PAYMENT_TYPES.map((type) => (
        <Stack
          direction='row'
          alignItems='center'
          gap={1}
          key={type.value}
          minWidth={110}
          borderRadius={10}
          textAlign='center'
          py={1}
          px={1.5}
          zIndex={1}
          onClick={() => {
            onChange && onChange(type.value)
          }}
          sx={{
            boxSizing: 'border-box',
            cursor: 'pointer',
            bgcolor: type.value === value ? 'primary.main' : 'transparent',
          }}
        >
          <Typography
            width={'100%'}
            textAlign={'center'}
            fontSize={16}
            fontWeight={600}
            color={type.value === value ? 'white' : 'text.secondary'}
          >
            {t(type.label)}
          </Typography>

          {type.value === 'yearly' &&
            maxYearlyDiscount &&
            renderTip(maxYearlyDiscount.discount_title || '')}

          {type.value === 'monthly' &&
            maxMonthlyDiscount &&
            renderTip(maxMonthlyDiscount.discount_title || '')}
        </Stack>
      ))}
    </Stack>
  )
}
export default PaymentTypeSwitch
