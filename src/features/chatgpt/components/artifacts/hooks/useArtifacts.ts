import { useRecoilState } from 'recoil'

import {
  ArtifactsFloatingWindowState,
  ArtifactsState,
  IArtifacts,
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

  return {
    isOpen: floatingWindow.open,
    mode: floatingWindow.mode,
    artifacts,
    updateArtifacts,
    showArtifacts,
    hideArtifacts,
    setMode,
  }
}
