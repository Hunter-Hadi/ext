import React, { FC } from 'react'
import Skeleton from '@mui/material/Skeleton'

interface LazyLoadImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  skeletonHeight?: number
}
const LazyLoadImage: FC<LazyLoadImageProps> = (props) => {
  const { src, alt, width, height, skeletonHeight } = props
  const [loaded, setLoaded] = React.useState(false)
  const [, setError] = React.useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => {
          setLoaded(true)
        }}
        onError={() => {
          setLoaded(true)
          setError(true)
        }}
      />
      {!loaded && (
        <Skeleton
          variant={'rounded'}
          height={skeletonHeight || height}
          width={width || '100%'}
        />
      )}
    </>
  )
}
export default LazyLoadImage
