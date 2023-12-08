import Skeleton from '@mui/material/Skeleton'
import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { getSearchWithAIRootElement } from '@/features/searchWithAI/utils'
import { getAppContextMenuRootElement } from '@/utils'

interface LazyLoadImageProps {
  src: string
  alt: string
  height: number
}

const LazyLoadImage: React.FC<LazyLoadImageProps> = ({ src, alt, height }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const lazyImageIdRef = useRef(uuidV4())
  useEffect(() => {
    const loadImage = () => {
      console.log(`loadImage`, src)
      const image = new Image()
      image.src = src
      image.onload = () => {
        setImageSrc(src)
        setIsLoading(false)
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
    const target =
      getMaxAISidebarRootElement()?.querySelector(lazyImageId) ||
      getAppContextMenuRootElement()?.querySelector(lazyImageId) ||
      getSearchWithAIRootElement()?.querySelector(lazyImageId) ||
      document.querySelector(lazyImageId)

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
        />
      ) : (
        <img src={imageSrc as string} alt={alt} height={height} />
      )}
    </>
  )
}

export default LazyLoadImage
