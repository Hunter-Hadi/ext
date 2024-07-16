import Stack from '@mui/material/Stack'
import React, { FC, useCallback, useEffect, useRef } from 'react'

import { IArtifactsPreviewProps } from '@/features/chatgpt/components/artifacts'
import { useReloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/components/useReloadArtifactsPreview'

const ArtifactsPreviewHtml: FC<IArtifactsPreviewProps> = (props) => {
  const { artifacts, sx } = props
  const boxRef = useRef<HTMLDivElement | null>(null)
  const rerenderHTML = useCallback(() => {
    if (!boxRef.current) {
      return
    }
    boxRef.current?.querySelector('iframe')?.remove()
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.src = 'https://www.maxai.space/?t=' + new Date().getTime()
    iframe.onload = () => {
      iframe?.contentWindow?.postMessage(artifacts.content, '*')
    }
    boxRef.current.appendChild(iframe)
  }, [artifacts.content])
  useEffect(() => {
    rerenderHTML()
  }, [rerenderHTML])
  useReloadArtifactsPreview(rerenderHTML)
  return <Stack ref={boxRef} sx={{ ...sx }} component={'div'}></Stack>
}

export { ArtifactsPreviewHtml }
