import Box from '@mui/material/Box'
import React, { FC, useMemo, useState } from 'react'
import useEffectOnce from '@/hooks/useEffectOnce'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { SxProps } from '@mui/material/styles'

interface YoutubePlayerBoxProps {
  youtubeLink: string
  cover?: string
  borderRadius?: number
  sx?: SxProps
}
const YoutubePlayerBox: FC<YoutubePlayerBoxProps> = (props) => {
  const { youtubeLink, borderRadius = 16, cover, sx } = props
  const [isAccessYoutube, setIsAccessYoutube] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const currentShowEmbedLink = useMemo(() => {
    if (cover) {
      return isAccessYoutube && videoLoaded
    }
    return true
  }, [cover, isAccessYoutube, videoLoaded])
  useEffectOnce(() => {
    clientFetchAPI('https://www.youtube.com/t/terms', {
      parse: 'text',
    })
      .then((result) => {
        if (result.success) {
          setIsAccessYoutube(true)
        }
      })
      .catch((event) => {})
  })
  return (
    <Box
      className="video-container"
      sx={{
        '&.video-container': {
          position: 'relative',
          paddingBottom: '56.25%' /* 16:9 */,
          height: 0,
        },
        '&.video-container iframe': {
          borderRadius: borderRadius + 'px',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },
        '&.video-container img': {
          borderRadius: borderRadius + 'px',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          objectFit: 'contain',
          height: '100%',
        },
        ...sx,
      }}
    >
      {!currentShowEmbedLink && cover && (
        <img src={cover} alt="Youtube video cover" />
      )}
      <iframe
        title="YouTube video player"
        width="560"
        height="315"
        src={youtubeLink}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => {
          setVideoLoaded(true)
        }}
        style={{
          visibility: currentShowEmbedLink ? 'visible' : 'hidden',
          width: currentShowEmbedLink ? '100%' : '0!important',
          height: currentShowEmbedLink ? '100%' : '0!important',
        }}
      />
    </Box>
  )
}
export default YoutubePlayerBox
