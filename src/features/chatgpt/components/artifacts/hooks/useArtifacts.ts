import { useMemo } from 'react'
import { useRecoilState } from 'recoil'

import {
  ArtifactsType,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'
import { reloadArtifactsPreview } from '@/features/chatgpt/components/artifacts/components/ArtifactsBase/ArtifactsPreview/useReloadArtifactsPreview'
import {
  ArtifactsFloatingWindowState,
  ArtifactsState,
} from '@/features/chatgpt/components/artifacts/store/ArtifactsState'

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useRecoilState(ArtifactsState)
  const [floatingWindow, setFloatingWindow] = useRecoilState(
    ArtifactsFloatingWindowState,
  )
  const updateArtifacts = (newArtifacts: Partial<IArtifacts>) => {
    console.log('updateArtifacts', newArtifacts)
    setArtifacts((prev) => ({
      ...prev,
      ...newArtifacts,
    }))
  }

  const showArtifacts = (mode?: 'preview' | 'code') => {
    setFloatingWindow((prev) => {
      return {
        open: true,
        mode: mode || prev.mode,
      }
    })
  }
  const hideArtifacts = () => {
    setFloatingWindow((prev) => {
      return {
        open: false,
        mode: prev.mode,
      }
    })
  }
  const setMode = (mode: 'preview' | 'code') => {
    setFloatingWindow((prev) => {
      return {
        open: prev.open,
        mode,
      }
    })
  }

  const isAbleToReload = useMemo(() => {
    if (floatingWindow.mode !== 'preview' || !artifacts?.type) {
      return false
    }
    return [ArtifactsType.HTML].includes(artifacts.type)
  }, [artifacts, floatingWindow.mode])

  return {
    isOpen: floatingWindow.open,
    mode: floatingWindow.mode,
    artifacts,
    artifactsType: artifacts.type,
    isAbleToReload,
    reloadArtifactsPreview,
    updateArtifacts,
    showArtifacts,
    hideArtifacts,
    setMode,
  }
}
