import CheckIcon from '@mui/icons-material/Check'
import LoadingButton from '@mui/lab/LoadingButton'
import { ButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConcatUsModal from '@/features/pricing/components/ConcatUsModal'
import SaveWithYearlyButton from '@/features/pricing/components/PlanButton/SaveWithYearlyButton'
import usePaymentCreator from '@/features/pricing/hooks/usePaymentCreator'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

interface IPlanButtonProps extends ButtonProps {
  renderType: RENDER_PLAN_TYPE
  sendLog?: () => void
  moreContent?: boolean
}

const PlanButton: FC<IPlanButtonProps> = (props) => {
  const {
    renderType,
    sendLog,
    moreContent,
    children,
    disabled,
    ...resetProps
  } = props

  const [isClicked, setIsClicked] = useState(false)
  const isClickedRef = useRef(isClicked)

  const { t } = useTranslation(['common', 'client'])
  const { loading: pricingLoading } = usePlanPricingInfo()
  const { loading: paymentLoading, createPaymentSubscription } =
    usePaymentCreator()

  const [open, setOpen] = useState(false)
  const [planText, setPlanText] = useState('')

  const isYearly = renderType.includes('yearly')

  // 当点击了按钮后才去显示实际loading
  // 目前把价格
  const fetchLoading = pricingLoading || paymentLoading
  const buttonLoading = isClicked ? fetchLoading : false

  const handleClick = async (plan = renderType) => {
    try {
      setIsClicked(true)
      sendLog && sendLog()

      // 如果当前是 fetching 状态，那么不做任何操作
      // 等 fetching 结束后，再执行 handleClick
      if (fetchLoading) {
        return
      }

      await createPaymentSubscription(plan, (planText) => {
        setOpen(true)
        setPlanText(planText)
      })

      setIsClicked(false)
    } catch (error) {
      setIsClicked(false)
    }
  }

  useEffect(() => {
    isClickedRef.current = isClicked
  }, [isClicked])

  useEffect(() => {
    // 作用在，当组件还在 fetching 时，用户点击了按钮
    // 会把 isClickedRef.current 设置成 true，
    // 等 fetching 结束后，再执行 handleClick
    if (isClickedRef.current && !pricingLoading) {
      setTimeout(handleClick, 0)
    }
  }, [pricingLoading])

  const renderMoreContent = () => {
    if (!moreContent) return null

    if (isYearly) {
      return (
        <Stack
          mt={1}
          direction='row'
          justifyContent='center'
          alignItems='center'
          spacing={1}
          height={20}
        >
          <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography fontSize={12} color='rgba(0, 0, 0, 0.6)'>
            {t('common:cancel_anytime')}
          </Typography>
        </Stack>
      )
    }

    return (
      <Stack mt={1} direction='row' justifyContent='center' alignItems='center'>
        <SaveWithYearlyButton
          plan={renderType}
          sx={{ height: 20 }}
          loading={buttonLoading}
          disabled={disabled}
          onClick={(plan) => handleClick(plan)}
        />
      </Stack>
    )
  }

  return (
    <>
      <LoadingButton
        variant='contained'
        {...resetProps}
        disabled={disabled}
        loading={buttonLoading}
        onClick={() => handleClick()}
      >
        {children}
      </LoadingButton>
      {renderMoreContent()}

      <ConcatUsModal
        planName={planText}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default PlanButton
