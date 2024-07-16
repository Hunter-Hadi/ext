import React, { forwardRef, useImperativeHandle } from 'react'

import {
  ArtifactsType,
  IArtifactsPreviewProps,
  IArtifactsPreviewRef,
} from '@/features/chatgpt/components/artifacts'
import { reloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/components/useReloadArtifactsPreview'

import { ArtifactsPreviewHtml } from './components'

const ArtifactsPreview = forwardRef<
  IArtifactsPreviewRef,
  IArtifactsPreviewProps
>(function ArtifactsPreviewRef(props, ref) {
  const type = props.artifacts.type
  useImperativeHandle(ref, () => ({
    reload: () => {
      reloadArtifactsPreview()
    },
  }))
  return (
    <>{type === ArtifactsType.HTML && <ArtifactsPreviewHtml {...props} />}</>
  )
})
export default ArtifactsPreview
