import React, { useState, useEffect, useRef } from 'react'
import Skeleton from '@mui/material/Skeleton'
import { v4 as uuidV4 } from 'uuid'
import { getAppContextMenuRootElement, getAppRootElement } from '@/utils'

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

    const target =
      getAppRootElement()?.querySelector(
        `#lazy-image-${lazyImageIdRef.current}`,
      ) ||
      getAppContextMenuRootElement()?.querySelector(
        `#lazy-image-${lazyImageIdRef.current}`,
      ) ||
      document.querySelector(`#lazy-image-${lazyImageIdRef.current}`)

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
