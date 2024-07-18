import Stack from '@mui/material/Stack'
import React, { FC, useCallback, useEffect, useRef } from 'react'

import { IArtifactsPreviewProps } from '@/features/chatgpt/components/artifacts'
import { useReloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/useReloadArtifactsPreview'
import { startSandBoxRender } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/utils'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'

const ArtifactsPreview: FC<IArtifactsPreviewProps> = (props) => {
  const { artifacts, sx } = props
  const boxRef = useRef<HTMLDivElement | null>(null)
  const rerenderHTML = useCallback(() => {
    if (!boxRef.current) {
      return
    }
    startSandBoxRender(boxRef.current, artifacts)
  }, [artifacts.content])
  useEffect(() => {
    if (artifacts.complete) {
      rerenderHTML()
    }
  }, [rerenderHTML, artifacts.content])
  useReloadArtifactsPreview(rerenderHTML)
  return (
    <Stack ref={boxRef} sx={{ ...sx }} component={'div'}>
      <AppLoadingLayout loading={!artifacts.complete} size={16} />
    </Stack>
  )
}

export default ArtifactsPreview
