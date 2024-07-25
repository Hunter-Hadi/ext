import Stack from '@mui/material/Stack'
import React, { FC, useEffect, useRef } from 'react'

import ImmersiveChatPortalWrapper from '@/apps/immersive-chat/components/ImmersiveChatPortal'
import { useArtifacts } from '@/features/chatgpt/components/artifacts'
import { ArtifactsBase } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase'
import { ArtifactsFloatingWindow } from '@/features/chatgpt/components/artifacts/components/ArtifactsFloatingWindow/ArtifactsFloatingWindow'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const ArtifactsRoot: FC = () => {
  const isFloatingWindowMode = useRef(!isMaxAIImmersiveChatPage())
  const rootReferenceRef = useRef<HTMLElement | null>(null)
  const { isOpen } = useArtifacts()
  useEffect(() => {
    const root = getMaxAISidebarRootElement()?.children?.[0]
    if (root) {
      rootReferenceRef.current = root as HTMLElement
    }
  }, [])
  if (!isOpen) {
    return null
  }
  return (
    <Stack className={'maxai--artifacts-root'}>
      {isFloatingWindowMode.current ? (
        <ArtifactsFloatingWindow reference={rootReferenceRef}>
          <ArtifactsBase />
        </ArtifactsFloatingWindow>
      ) : (
        <ImmersiveChatPortalWrapper>
          <ArtifactsBase
            sx={{
              width: 'calc(100% - 24px)',
              height: 'calc(100% - 32px)',
              margin: '16px 0 0 8px',
            }}
          />
        </ImmersiveChatPortalWrapper>
      )}
    </Stack>
  )
}
export { ArtifactsRoot }
