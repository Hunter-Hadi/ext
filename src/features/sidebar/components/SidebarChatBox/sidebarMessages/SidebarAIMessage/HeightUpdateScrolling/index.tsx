import { Stack, styled } from '@mui/material'
import throttle from 'lodash-es/throttle'
import React, { FC, useEffect, useMemo, useRef } from 'react'

const StackWrap = styled(Stack)({
  '&.scroll-masked': {
    '--scrollbar-width': '13px',
    '--mask-top-height': '30px',
    '--mask-bottom-height': '56px',
    '--mask-size-content': 'calc(100% - var(--scrollbar-width)) 100%',
    '--mask-image-scrollbar': 'linear-gradient(#000, #000)',
    '--mask-size-scrollbar': 'var(--scrollbar-width) 100%',
    overflow: 'hidden',
    position: 'relative',
    WebkitMaskImage:
      'linear-gradient(to bottom, transparent, #000 var(--mask-top-height), #000 calc(100% - var(--mask-bottom-height)), transparent)',
    maskImage:
      'linear-gradient(to bottom, transparent, #000 var(--mask-top-height), #000 calc(100% - var(--mask-bottom-height)), transparent), linear-gradient(#000, #000)',
    WebkitMaskPosition: '0 0, 100% 0',
    maskPosition: '0 0, 100% 0',
    WebkitMaskRepeat: 'no-repeat, no-repeat',
    maskRepeat: 'no-repeat, no-repeat',
    WebkitMaskSize:
      'calc(100% - var(--scrollbar-width)) 100%, var(--scrollbar-width) 100%',
    maskSize:
      'calc(100% - var(--scrollbar-width)) 100%, var(--scrollbar-width) 100%',
  },
  '&.scroll-masked-both': {
    WebkitMaskImage:
      'linear-gradient(to bottom, transparent, #000 var(--mask-top-height), #000 calc(100% - var(--mask-bottom-height)), transparent), linear-gradient(#000, #000)',
    maskImage:
      'linear-gradient(to bottom, transparent, #000 var(--mask-top-height), #000 calc(100% - var(--mask-bottom-height)), transparent), linear-gradient(#000, #000)',
  },
  '&.scroll-masked-bottom': {
    WebkitMaskImage:
      'linear-gradient(to bottom, #000 calc(100% - var(--mask-bottom-height)), transparent)',
    maskImage:
      'linear-gradient(to bottom, #000 calc(100% - var(--mask-bottom-height)), transparent)',
  },
  '&.scroll-masked-top': {
    WebkitMaskImage:
      'linear-gradient(to top, #000 calc(100% - var(--mask-top-height)), transparent)',
    maskImage:
      'linear-gradient(to top, #000 calc(100% - var(--mask-top-height)), transparent)',
  },
})
let lastScrollTop = 0,
  isScrollView = false
interface IProps {
  children: React.ReactNode
  height?: number
  update?: string
  computeConfig?: {
    maxId: string
    otherHeight: number
    minHeight?: number
  }
}
export const HeightUpdateScrolling: FC<IProps> = ({
  children,
  height,
  update,
  computeConfig,
}) => {
  const scrollTopRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    isScrollView = false
  }, [])
  useEffect(() => {
    if (!isScrollView && update) {
      scrollToBottom()
    }
  }, [update, scrollRef])
  const scrollToBottom = throttle(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, 100) // 100ms的延迟
  const computeMaxHeightThrottle = throttle(() => {
    //配置了计算父级容器的最大高度
    if (scrollTopRef && computeConfig) {
      const otherViewHeight = computeConfig.otherHeight
      const minViewHeight = computeConfig.minHeight || 200
      const messageListContainerHeight = scrollTopRef.current?.closest(
        `${computeConfig.maxId}`,
      )?.clientHeight
      if (
        messageListContainerHeight &&
        messageListContainerHeight > otherViewHeight
      ) {
        const currentHeight = messageListContainerHeight - otherViewHeight
        if (currentHeight > minViewHeight) {
          return currentHeight
        } else {
          return minViewHeight
        }
      } else {
        return minViewHeight
      }
    } else {
      return 0
    }
  }, 500)
  const computeMaxHeight = useMemo(() => {
    return computeMaxHeightThrottle()
  }, [scrollTopRef.current, computeConfig])
  const maxHeight = computeMaxHeight || height || 350

  useEffect(() => {
    const handleScroll = throttle(() => {
      try {
        if (scrollRef.current && scrollTopRef.current) {
          const scrollTop = scrollRef.current.scrollTop
          const scrollHeight = scrollRef.current.scrollHeight
          const clientHeight = scrollRef.current.clientHeight
          // 如果用户手动滚动，则停止自动滚动
          if (scrollTop < lastScrollTop && scrollTop > maxHeight) {
            isScrollView = true
          }
          lastScrollTop = scrollTop
          if (!(scrollHeight > clientHeight || scrollHeight > maxHeight)) {
            //没有出现滚动条啦
            scrollTopRef.current.classList.remove(
              'scroll-masked-both',
              'scroll-masked-top',
              'scroll-masked-bottom',
            )
            return
          }
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          if (scrollTop <= 10) {
            // 滚动到距离顶部10的位置
            scrollTopRef.current.classList.remove(
              'scroll-masked-both',
              'scroll-masked-top',
            )
            scrollTopRef.current.classList.add(
              'scroll-masked',
              'scroll-masked-bottom',
            )
          } else if (distanceFromBottom <= 10) {
            // 滚动到底部10度为主
            scrollTopRef.current.classList.remove(
              'scroll-masked-both',
              'scroll-masked-top',
            )
            scrollTopRef.current.classList.add(
              'scroll-masked',
              'scroll-masked-top',
            )
          } else {
            scrollTopRef.current.classList.remove(
              'scroll-masked-top',
              'scroll-masked-bottom',
            )
            scrollTopRef.current.classList.add(
              'scroll-masked',
              'scroll-masked-both',
            )
          }
        }
      } catch (e) {
        console.log('e', e)
      }
    }, 50)
    scrollRef.current?.addEventListener('scroll', handleScroll)
    return () => {
      scrollRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [])
  return (
    <StackWrap ref={scrollTopRef}>
      <div
        ref={scrollRef}
        style={{
          maxHeight: maxHeight + 'px',
          overflowY: 'auto',
          paddingRight: '10px',
        }}
      >
        {children}
      </div>
    </StackWrap>
  )
}
