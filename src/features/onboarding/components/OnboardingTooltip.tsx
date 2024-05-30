import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import React, { FC, PropsWithChildren, useCallback, useEffect } from 'react'

import TooltipInformationBar, {
  ITooltipInformationBarProps,
} from '@/features/onboarding/components/TooltipInformationBar'
import { IOnBoardingSceneType } from '@/features/onboarding/types'
import {
  getAlreadyOpenedCacheBySceneType,
  setOpenedCacheBySceneType,
} from '@/features/onboarding/utils'
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

export interface IOnboardingTooltipProps extends TooltipProps {
  sceneType: IOnBoardingSceneType

  // 外部组件可以通过传入 triggerState 控制 OnboardingTooltip是否显示，
  // 如果传递了 showStateTrigger, 内部需要根据 showStateTrigger 控制 Tooltip 的显示状态，同时只显示一次（根据 sceneType 获取 onboarding cache flag）
  showStateTrigger?: () => boolean

  floatingMenuTooltip?: boolean
  minimumTooltip?: boolean

  InformationBarProps?: ITooltipInformationBarProps
}

const OnboardingTooltip: FC<PropsWithChildren<IOnboardingTooltipProps>> = (
  props,
) => {
  const {
    sceneType,
    showStateTrigger,
    minimumTooltip,
    floatingMenuTooltip,
    InformationBarProps,
    ...resetProps
  } = props

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

  const [open, setOpen] = React.useState(false)

  const openTooltip = useCallback(() => {
    // 根据 sceneType 获取 onboarding cache
    // 判断是否打开过，如果打开过则不再显示
    getAlreadyOpenedCacheBySceneType(sceneType).then((opened) => {
      if (!opened) {
        setOpen(true)
        setOpenedCacheBySceneType(sceneType)
      }
    })
  }, [sceneType])

  const closeTooltip = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!showStateTrigger) {
      // 如果没传入 showStateTrigger，直接显示
      openTooltip()
      return
    }
    if (showStateTrigger()) {
      openTooltip()
    } else {
      closeTooltip()
    }
  }, [showStateTrigger, openTooltip, closeTooltip])

  return (
    <BlackTooltip
      placement={props.placement || 'top'}
      {...resetProps}
      open={open}
      PopperProps={{
        container,
        ...resetProps.PopperProps,
        style: {
          ...props.style,
          zIndex: 2147483619,
        },
        sx: {
          '&[data-popper-placement*="bottom"] > div': {
            marginTop: props.arrow ? '10px!important' : '4px!important',
          },
          '&[data-popper-placement*="top"] > div': {
            marginBottom: props.arrow ? '10px!important' : '4px!important',
          },
          '&[data-popper-placement*="right"] > div': {
            marginLeft: props.arrow ? '10px!important' : '4px!important',
          },
          '&[data-popper-placement*="left"] > div': {
            marginRight: props.arrow ? '10px!important' : '4px!important',
          },
          ...props.PopperProps?.sx,
        },
      }}
      title={
        <TooltipInformationBar {...InformationBarProps}>
          {resetProps.title}
        </TooltipInformationBar>
      }
    >
      <div>{props.children}</div>
    </BlackTooltip>
  )
}

export default OnboardingTooltip
