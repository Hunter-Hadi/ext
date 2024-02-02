import { Placement } from '@floating-ui/react'
import Skeleton from '@mui/material/Skeleton'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { getSearchWithAIRootElement } from '@/features/searchWithAI/utils'
import { getAppContextMenuRootElement } from '@/utils'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    boxShadow: theme.shadows[1],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

interface LazyLoadImageProps {
  src: string
  alt: string
  width?: number
  height: number
  preview?: boolean
  placement?: Placement
  maxRetryTimes?: number
  sx?: SxProps
}

const LazyLoadImage: React.FC<LazyLoadImageProps> = (props) => {
  const {
    src,
    alt,
    height,
    width = '100%',
    sx,
    maxRetryTimes = 1,
    preview,
    placement,
  } = props
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const lazyImageIdRef = useRef(uuidV4())
  useEffect(() => {
    console.log(`[LazyLoadImage] useEffect`, src)
    const loadImage = async () => {
      const loadOneTimesImage = async () => {
        return new Promise((resolve) => {
          const image = new Image()
          image.src = src
          image.onload = () => {
            setImageSrc(src)
            setIsLoading(false)
            resolve(true)
          }
          image.onerror = () => {
            resolve(false)
          }
        })
      }
      // 因为有时候图片加载失败，所以需要重试
      for (let i = -1; i < maxRetryTimes; i++) {
        if (await loadOneTimesImage()) {
          break
        }
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
          observer.unobserve(entry.target)
        }
      })
    })
    const lazyImageId = `#lazy-image-${lazyImageIdRef.current}`
    let target: HTMLElement | null = null
    if (getMaxAISidebarRootElement()?.querySelector(lazyImageId)) {
      setContainer(getMaxAISidebarRootElement() as HTMLElement)
      target = getMaxAISidebarRootElement()?.querySelector(
        lazyImageId,
      ) as HTMLElement
    } else if (getAppContextMenuRootElement()?.querySelector(lazyImageId)) {
      setContainer(getAppContextMenuRootElement() as HTMLElement)
      target = getAppContextMenuRootElement()?.querySelector(
        lazyImageId,
      ) as HTMLElement
    } else if (getSearchWithAIRootElement()?.querySelector(lazyImageId)) {
      setContainer(getSearchWithAIRootElement() as HTMLElement)
      target = getSearchWithAIRootElement()?.querySelector(
        lazyImageId,
      ) as HTMLElement
    } else {
      target = document.querySelector(lazyImageId) as HTMLElement
    }
    if (target) {
      observer.observe(target)
    }
    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [src])

  return (
    <>
      {isLoading ? (
        <Skeleton
          id={`lazy-image-${lazyImageIdRef.current}`}
          variant="rectangular"
          height={height}
          sx={{
            width: width,
            ...sx,
          }}
        />
      ) : (
        <LightTooltip
          placement={placement || 'top'}
          title={
            preview ? (
              <img
                src={imageSrc as string}
                alt={alt}
                width={256}
                height={256}
              />
            ) : null
          }
          PopperProps={{
            container,
            style: {
              zIndex: '2147483660!important',
            },
          }}
        >
          <img
            src={imageSrc as string}
            alt={alt}
            width={width}
            height={height}
          />
        </LightTooltip>
      )}
    </>
  )
}

export default LazyLoadImage
