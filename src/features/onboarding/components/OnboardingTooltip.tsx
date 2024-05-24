import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import React, { FC, PropsWithChildren } from 'react'

import TooltipContentBox, {
  ITooltipContentBoxProps,
} from '@/features/onboarding/components/TooltipContentBox'
import {
  getAppMinimizeContainerElement,
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'

const BlackTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: '#fff',
    padding: '12px',
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

interface IOnboardingTooltipProps extends TooltipProps {
  floatingMenuTooltip?: boolean
  minimumTooltip?: boolean

  contentProps?: ITooltipContentBoxProps
}

const OnboardingTooltip: FC<PropsWithChildren<IOnboardingTooltipProps>> = (
  props,
) => {
  const { minimumTooltip, floatingMenuTooltip, contentProps, ...resetProps } =
    props

  let container: any = document.body
  if (minimumTooltip) {
    container = getAppMinimizeContainerElement()
  } else {
    container = floatingMenuTooltip
      ? getMaxAIFloatingContextMenuRootElement()
      : getMaxAISidebarRootElement()
  }
  if (props.PopperProps?.container) {
    container = props.PopperProps.container
  }
  if (!container) {
    container = document.body
  }
  return (
    <BlackTooltip
      {...resetProps}
      open
      placement={props.placement || 'top'}
      PopperProps={{
        container,
        ...resetProps.PopperProps,
        style: {
          ...props.style,
          zIndex: 2147483620,
        },
        sx: {
          '&[data-popper-placement*="bottom"] > div': {
            marginTop: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="top"] > div': {
            marginBottom: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="right"] > div': {
            marginLeft: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="left"] > div': {
            marginRight: props.arrow ? '8px!important' : '4px!important',
          },
          ...props.PopperProps?.sx,
        },
      }}
      title={
        <TooltipContentBox {...contentProps}>
          {resetProps.title}
        </TooltipContentBox>
      }
    >
      <div>{props.children}</div>
    </BlackTooltip>
  )
}

export default OnboardingTooltip
