import { Placement } from '@floating-ui/react'
import Skeleton from '@mui/material/Skeleton'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import isNumber from 'lodash-es/isNumber'
import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { getSearchWithAIRootElement } from '@/features/searchWithAI/utils'
import { clientProxyFetchAPI } from '@/features/shortcuts/utils'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

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
  maxLoadingTime?: number
  SkeletonSx?: SxProps
  imgStyle?: React.CSSProperties
  fileId?: string
  onError?: () => void
}

const LazyLoadImage: React.FC<LazyLoadImageProps> = (props) => {
  const {
    src,
    alt,
    height,
    width = '100%',
    SkeletonSx,
    maxRetryTimes = 1,
    maxLoadingTime = 10 * 1000,
    preview,
    placement,
    imgStyle,
    fileId,
    onError,
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
          const timer = setTimeout(() => {
            setIsLoading(false)
            resolve(false)
          }, maxLoadingTime)
          const image = new Image()
          image.src = src
          image.onload = () => {
            clearTimeout(timer)
            setImageSrc(src)
            setIsLoading(false)
            resolve(true)
          }
          image.onerror = async () => {
            clearTimeout(timer)
            // 用background fetch一次
            const result = await clientProxyFetchAPI(src, {
              parse: 'blob',
              method: 'GET',
            })
            if (result) {
              const responseStatusCode = result.responseRaw?.status
              if (isNumber(responseStatusCode) && responseStatusCode >= 400) {
                setIsLoading(false)
                if (fileId) {
                  // 403和404的图片不再重试
                  setImageSrc(
                    getChromeExtensionAssetsURL(
                      `/images/svg-icons/image-invalid.svg`,
                    ),
                  )
                  resolve(true)
                } else {
                  resolve(false)
                }
                return
              }
              if (result.success) {
                setImageSrc(URL.createObjectURL(result.data))
              }
              setIsLoading(false)
              resolve(result.success)
            } else {
              resolve(false)
            }
          }
        })
      }
      // 因为有时候图片加载失败，所以需要重试
      for (let i = -1; i < maxRetryTimes; i++) {
        if (await loadOneTimesImage()) {
          return true
        }
      }
      return false
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage().then((success) => {
            if (!success) {
              onError && onError()
            }
          })
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
    } else if (
      getMaxAIFloatingContextMenuRootElement()?.querySelector(lazyImageId)
    ) {
      setContainer(getMaxAIFloatingContextMenuRootElement() as HTMLElement)
      target = getMaxAIFloatingContextMenuRootElement()?.querySelector(
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
          className={'maxai--lazy-load--skeleton'}
          id={`lazy-image-${lazyImageIdRef.current}`}
          variant='rectangular'
          height={height}
          sx={{
            width: width,
            borderRadius: imgStyle?.borderRadius || 0,
            ...SkeletonSx,
          }}
        />
      ) : (
        <LightTooltip
          placement={placement || 'top'}
          title={
            preview ? (
              <img
                style={{
                  objectFit: 'contain',
                  ...imgStyle,
                }}
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
            style={{
              ...imgStyle,
            }}
          />
        </LightTooltip>
      )}
    </>
  )
}

export default LazyLoadImage
