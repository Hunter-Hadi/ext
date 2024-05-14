import Popper from '@mui/material/Popper'
import React, { FC, useEffect } from 'react'

import useTarget, {
  Gap,
} from '@/features/common/components/Tour/hooks/useTarget'
import TourMask, { Placement } from '@/features/common/components/Tour/TourMask'
import TourStep, {
  TourStepInfo,
} from '@/features/common/components/Tour/TourStep'

const defaultScrollIntoViewOptions: ScrollIntoViewOptions = {
  block: 'center',
  inline: 'center',
}

export interface TourProps {
  steps: TourStepInfo[]
  open?: boolean
  defaultCurrent?: number
  current?: number
  onClose?: () => void
  onFinish?: () => void
  onChange?: (current: number) => void
  zIndex?: number
  disabledInteraction?: boolean
  gap?: Gap
  rootContainer?: HTMLElement
  animation?: boolean
  animationDuration?: number
  maskMode?: 'absolute' | 'fixed'
}

/**
 * Tour引导组件
 * @param props
 * @description - 参考Antd Tour组件的实现
 * @link - // https://github.com/react-component/tour/blob/master/src/Tour.tsx
 */
const Tour: FC<TourProps> = (props) => {
  const {
    steps,
    open,
    defaultCurrent,
    current,
    onClose,
    onFinish,
    onChange,
    zIndex,
    disabledInteraction = true,
    animation = true,
    animationDuration,
    gap,
    rootContainer,
    maskMode,
  } = props
  // current
  const [innerCurrent, setInnerCurrent] = React.useState<number>(
    current ?? defaultCurrent ?? 0,
  )
  useEffect(() => {
    if (current !== undefined) {
      // 如果current不在范围内，则设置为0
      if (current < 0 || current >= steps.length) {
        setInnerCurrent(0)
        return
      }
      setInnerCurrent(current)
    }
  }, [current, steps])
  // open

  const {
    target,
    title: stepTitle,
    description: stepDescription,
    imgCover: stepImgCover,
    placement: stepPlacement,
    arrow: stepArrow,
    sx: stepSx,
    mask: stepMask,
    scrollIntoViewOptions = defaultScrollIntoViewOptions,
    gap: stepGap,
    closeIcon,
    renderPanel,
  } = steps[innerCurrent]

  const [innerOpen, setInnerOpen] = React.useState<boolean>(open ?? false)
  const currentGap = stepGap ?? gap
  const currentMask = innerOpen && (stepMask ?? true)
  const currentShowMask =
    typeof currentMask === 'boolean' ? currentMask : !!currentMask
  const [posInfo, targetElement] = useTarget(
    target,
    innerOpen,
    rootContainer,
    currentGap,
    scrollIntoViewOptions,
  )
  const popperOffset =
    ((gap as any)?.offset?.[1] || (gap as any)?.offset?.[0] || 6) +
    (stepArrow ? 16 : 8)
  console.log('popperOffset', popperOffset, posInfo)
  if (!rootContainer) {
    return null
  }
  return (
    <>
      {posInfo && (
        <TourMask
          animation={animation}
          open={currentShowMask}
          pos={posInfo}
          showMask={currentShowMask}
          zIndex={zIndex}
          disabledInteraction={disabledInteraction}
          animationDuration={animationDuration}
          maskMode={maskMode}
        />
      )}
      <Popper
        disablePortal
        open={innerOpen && !!targetElement}
        anchorEl={targetElement}
        placement={stepPlacement}
        container={rootContainer}
        style={{ zIndex: (zIndex || 0) + 1 }}
        modifiers={[
          // using gap
          {
            name: 'offset',
            options: {
              offset: [0, popperOffset],
            },
          },
        ]}
      >
        {({ placement }) => {
          return (
            <TourStep
              title={stepTitle}
              description={stepDescription}
              imgCover={stepImgCover}
              arrow={stepArrow}
              target={targetElement}
              placement={
                placement.startsWith('auto')
                  ? stepPlacement
                  : (placement as Placement)
              }
              renderPanel={renderPanel}
              mask={stepMask}
              sx={stepSx}
              closeIcon={closeIcon}
              current={innerCurrent + 1}
              total={steps.length}
              onClose={() => {
                setInnerOpen(false)
                onClose?.()
              }}
              onNext={() => {
                setInnerCurrent((c) => {
                  const next = c + 1
                  if (next < steps.length) {
                    onChange?.(next)
                    return next
                  }
                  return c
                })
              }}
              onPrev={() => {
                setInnerCurrent((c) => {
                  const prev = c - 1
                  if (prev >= 0) {
                    onChange?.(prev)
                    return prev
                  }
                  return c
                })
              }}
              onFinish={() => {
                setInnerOpen(false)
                onFinish?.()
              }}
            />
          )
        }}
      </Popper>
    </>
  )
}
export default Tour
