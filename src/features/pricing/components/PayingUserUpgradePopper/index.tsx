import Box from '@mui/material/Box'
import Grow from '@mui/material/Grow'
import Popper, { PopperPlacementType } from '@mui/material/Popper'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import PayingUserUpgradeCard from '@/features/pricing/components/PayingUserUpgradeCard'
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
            <PayingUserUpgradeCard renderPlan={renderPlan} sx={popperPaperSx} />
          </Grow>
        )}
      </Popper>
    </Box>
  )
}

export default PayingUserUpgradePopper
