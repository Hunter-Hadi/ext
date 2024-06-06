import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
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
    padding: '0px',
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
  // 使用 function 的问题，是 showStateTrigger 如果是匿名函数会一直更新触发 useEffect,  OnboardingTooltip 就会一直去判断是否显示 tooltip
  showStateTrigger?: boolean | (() => boolean)

  floatingMenuTooltip?: boolean
  minimumTooltip?: boolean

  InformationBarProps?: ITooltipInformationBarProps

  // 在打开 Tooltip 之前的 回掉函数，如果这个函数返回 false ，会阻止 Tooltip 打开
  beforeTooltipShow?: (
    container?: HTMLElement | null,
    sceneType?: IOnBoardingSceneType,
  ) => Promise<boolean> | boolean
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
    beforeTooltipShow,
    ...resetProps
  } = props

  let container: HTMLElement | null = document.body
  if (minimumTooltip) {
    container = getAppMinimizeContainerElement()
  } else {
    container = floatingMenuTooltip
      ? getMaxAIFloatingContextMenuRootElement()
      : getMaxAISidebarRootElement()
  }
  if (props.PopperProps?.container) {
    container = props.PopperProps.container as HTMLElement
  }
  if (!container) {
    container = document.body
  }

  const [open, setOpen] = React.useState(false)

  const openTooltip = useCallback(async () => {
    // 如果返回 false ，会阻止 Tooltip 打开
    const beforeTooltipShowResponse = beforeTooltipShow
      ? await beforeTooltipShow(container, sceneType)
      : true

    if (beforeTooltipShowResponse) {
      // 根据 sceneType 获取 onboarding cache
      // 判断是否打开过，如果打开过则不再显示
      const opened = await getAlreadyOpenedCacheBySceneType(sceneType)
      if (!opened) {
        // 设置完缓存，再 setOpen
        setOpenedCacheBySceneType(sceneType).then(() => {
          setOpen(true)
        })
      }
    }
  }, [sceneType, beforeTooltipShow, container])

  const closeTooltip = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (showStateTrigger === undefined) {
      // 如果没传入 showStateTrigger，直接显示
      openTooltip()
      return
    }

    const showStateTriggerFunction =
      typeof showStateTrigger === 'function'
        ? showStateTrigger
        : () => showStateTrigger

    if (showStateTriggerFunction()) {
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
      id={`ONBOARDING_TOOLTIP__${sceneType}`}
      PopperProps={{
        container,
        ...resetProps.PopperProps,
        style: {
          textAlign: 'left',
          zIndex: 2147483621,
          ...props.style,
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
        <Box
          sx={{
            position: 'relative',
            p: 1.5,
            pt: 2,
            pr: 2.25,
            textTransform: 'none',
          }}
        >
          <IconButton
            size='small'
            onClick={closeTooltip}
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              p: '2px',
            }}
          >
            <CloseOutlinedIcon
              sx={{
                fontSize: '14px',
                color: 'text.secondary',
              }}
            />
          </IconButton>
          <TooltipInformationBar {...InformationBarProps}>
            {resetProps.title}
          </TooltipInformationBar>
        </Box>
      }
    >
      <div>{props.children}</div>
    </BlackTooltip>
  )
}

export default OnboardingTooltip
