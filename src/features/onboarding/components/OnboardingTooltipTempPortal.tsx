/**
 * 基于 config 的配置，找到 config 中配置的 element selector
 * 监听 元素 变化来找到 referenceElement
 * 用 referenceElement 的位置来定位 tooltip
 */

import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import OnboardingTooltip, {
  IOnboardingTooltipProps,
} from '@/features/onboarding/components/OnboardingTooltip'
import OnboardingTooltipTitleRender from '@/features/onboarding/components/OnboardingTooltipTitleRender'
import useOnboardingTooltipConfig from '@/features/onboarding/hooks/useOnboardingTooltipConfig'
import { IOnBoardingSceneType } from '@/features/onboarding/types'
import { getAlreadyOpenedCacheBySceneType } from '@/features/onboarding/utils'
import {
  getAppMinimizeContainerElement,
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { elementCheckFullyVisible } from '@/utils/dataHelper/elementHelper'

interface IOnboardingTooltipTempPortalProps {
  title?: React.ReactNode
  sceneType: IOnBoardingSceneType
  container?: HTMLElement | null
  showStateTrigger?: IOnboardingTooltipProps['showStateTrigger']
}

const OnboardingTooltipTempPortal: FC<IOnboardingTooltipTempPortalProps> = ({
  title,
  sceneType,
  container: propContainer,
  showStateTrigger,
}) => {
  // 已经 展示过这个 sceneType 的 onboarding 标记
  const [alreadyOpened, setAlreadyOpened] = useState<boolean>(false)
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  )
  const observerRef = useRef<MutationObserver | null>(null)
  const onboardingConfig = useOnboardingTooltipConfig(sceneType)

  const container = useMemo(() => {
    if (propContainer) {
      return propContainer
    }
    let container: HTMLElement | null = document.body
    if (onboardingConfig?.tooltipProps?.minimumTooltip) {
      container = getAppMinimizeContainerElement()
    } else {
      container = onboardingConfig?.tooltipProps?.floatingMenuTooltip
        ? getMaxAIFloatingContextMenuRootElement()
        : getMaxAISidebarRootElement()
    }

    if (!container) {
      container = document.body
    }
    return container
  }, [propContainer, onboardingConfig])

  const syncAlreadyOpenedCacheBySceneType = useCallback(() => {
    if (alreadyOpened) {
      return
    }
    getAlreadyOpenedCacheBySceneType(sceneType).then((opened) => {
      setAlreadyOpened(opened)
    })
  }, [sceneType, alreadyOpened])

  // // 用 useInterval 来找 referenceElement
  // useInterval(
  //   () => {
  //     if (onboardingConfig?.referenceElementSelector) {
  //       const referenceElement = container.querySelector<HTMLElement>(
  //         onboardingConfig.referenceElementSelector,
  //       )
  //       if (referenceElement) {
  //         setReferenceElement(referenceElement)
  //       }
  //     }
  //   },
  //   // 找到了就不找了
  //   referenceElement ? null : 500,
  // )

  useEffect(() => {
    // 已经找到了 referenceElement，不需要再监听
    // 或者已经展示过了，不需要再监听
    if (referenceElement || alreadyOpened) {
      observerRef.current?.disconnect()
    }
    if (container && onboardingConfig?.referenceElementSelector) {
      // 用 MutationObserver 来检测邮件内容是否加载完成
      observerRef.current = new MutationObserver(() => {
        const referenceElement = container.querySelector<HTMLElement>(
          onboardingConfig.referenceElementSelector,
        )
        if (referenceElement && elementCheckFullyVisible(referenceElement)) {
          setReferenceElement(referenceElement)
        } else {
          setReferenceElement(null)
        }
      })
      observerRef.current.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [
    container,
    onboardingConfig?.referenceElementSelector,
    referenceElement,
    alreadyOpened,
  ])

  useFocus(syncAlreadyOpenedCacheBySceneType)

  useEffectOnce(syncAlreadyOpenedCacheBySceneType)

  if (sceneType === 'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM') {
    console.log('referenceElement', referenceElement, alreadyOpened, container)
  }

  // // 如果已经展示过了，不再渲染任何内容
  // if (alreadyOpened) {
  //   return null
  // }

  if (!onboardingConfig || !referenceElement) {
    return null
  }

  return (
    <>
      {onboardingConfig && referenceElement ? (
        <OnboardingTooltip
          sceneType={sceneType}
          {...onboardingConfig.tooltipProps}
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

export default OnboardingTooltipTempPortal
