/**
 * 基于 config 的配置，找到 config 中配置的 element selector
 * 监听 元素 变化来找到 referenceElement
 * 用 referenceElement 的位置来定位 tooltip
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useInterval from '@/features/common/hooks/useInterval'
import { OnboardingTooltipTitleRender } from '@/features/onboarding/components/OnboardingTooltip'
import {
  IOnboardingTooltipProps,
  OnboardingTooltip,
} from '@/features/onboarding/components/OnboardingTooltip/OnboardingTooltip'
import useOnboardingTooltipConfig from '@/features/onboarding/hooks/useOnboardingTooltipConfig'
import { IOnBoardingSceneType } from '@/features/onboarding/types'
import {
  findOnboardingReferenceElement,
  getAlreadyOpenedCacheBySceneType,
} from '@/features/onboarding/utils'
import {
  getAppMinimizeContainerElement,
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'

interface IOnboardingTooltipPortalProps {
  title?: React.ReactNode
  sceneType: IOnBoardingSceneType
  container?: HTMLElement | null
  showStateTrigger?: IOnboardingTooltipProps['showStateTrigger']
}

export const OnboardingTooltipPortal: FC<IOnboardingTooltipPortalProps> = ({
  title,
  sceneType,
  container: propContainer,
  showStateTrigger,
}) => {
  const [enable, setEnable] = useState<boolean>(false)
  // 已经 展示过这个 sceneType 的 onboarding 标记, 默认为 true
  // 这个 标记 需要在 组件第一次加载时同步一次缓存
  const [alreadyOpened, setAlreadyOpened] = useState<boolean>(true)
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  )
  const onboardingConfig = useOnboardingTooltipConfig(sceneType)

  const container = useMemo(() => {
    if (propContainer) {
      return propContainer
    }
    let container: HTMLElement | null = document.body
    if (onboardingConfig?.tooltipProps?.minimumTooltip) {
      container = getAppMinimizeContainerElement()
    } else if (onboardingConfig?.tooltipProps?.floatingMenuTooltip) {
      container = getMaxAIFloatingContextMenuRootElement()
    }
    if (onboardingConfig?.containerFinder) {
      container = onboardingConfig?.containerFinder()
    }
    if (onboardingConfig?.tooltipProps?.PopperProps?.container) {
      container = onboardingConfig.tooltipProps.PopperProps
        .container as HTMLElement
    }
    if (!container) {
      container = getMaxAISidebarRootElement()
    }
    if (!container) {
      container = document.body
    }
    return container
  }, [propContainer, onboardingConfig])

  const syncAlreadyOpenedCacheBySceneType = useCallback(() => {
    getAlreadyOpenedCacheBySceneType(sceneType).then((opened) => {
      setAlreadyOpened(opened)
    })
  }, [sceneType])

  const intervalEnable = useMemo(() => {
    // 如果已经展示过了，就不再开启计时器
    // 如果已经找到了 referenceElement，就不再开启计时器
    // 如果没有 container，就不开启计时器
    // 如果 enable 为 false，就不开启计时器
    return !alreadyOpened && !referenceElement && container && enable
  }, [alreadyOpened, referenceElement, container, enable])

  // 用 useInterval 来找 referenceElement
  useInterval(
    () => {
      if (container && onboardingConfig?.referenceElementSelector) {
        const referenceElement = findOnboardingReferenceElement(
          container,
          onboardingConfig.referenceElementSelector,
        )
        if (referenceElement) {
          setReferenceElement(referenceElement)
        } else {
          setReferenceElement(null)
        }
      }
    },
    intervalEnable ? 300 : null,
  )

  useEffectOnce(syncAlreadyOpenedCacheBySceneType)

  useEffect(() => {
    setEnable(true)
  }, [])

  if (!enable) {
    return null
  }

  if (alreadyOpened) {
    return null
  }

  if (!onboardingConfig || !referenceElement) {
    return null
  }

  return (
    <>
      {onboardingConfig && referenceElement ? (
        <OnboardingTooltip
          sceneType={sceneType}
          {...onboardingConfig.tooltipProps}
          referenceElement={referenceElement}
          showStateTrigger={showStateTrigger}
          title={
            // 可以外部传入
            title ??
            // 也可以在配置中传入
            onboardingConfig.tooltipProps?.title ?? (
              // 也可以在 OnboardingTooltipTitleRender 中配置
              <OnboardingTooltipTitleRender sceneType={sceneType} />
            )
          }
          arrow={onboardingConfig.tooltipProps?.arrow ?? true}
          PopperProps={{
            ...onboardingConfig.tooltipProps?.PopperProps,
            container,
            anchorEl: {
              getBoundingClientRect: () => {
                return referenceElement.getBoundingClientRect()
              },
            },
          }}
        >
          <span />
        </OnboardingTooltip>
      ) : null}
    </>
  )
}
