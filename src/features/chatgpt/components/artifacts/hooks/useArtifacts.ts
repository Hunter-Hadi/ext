import { useRecoilState } from 'recoil'

import {
  ArtifactsOpenState,
  ArtifactsState,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts/store/ArtifactsState'

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useRecoilState(ArtifactsState)
  const [isOpen, setIsOpen] = useRecoilState(ArtifactsOpenState)
  const updateArtifacts = (newArtifacts: Partial<IArtifacts>) => {
    console.log('updateArtifacts', newArtifacts)
    setArtifacts((prev) => ({
      ...prev,
      ...newArtifacts,
    }))
  }

  const showArtifacts = () => {
    setIsOpen(true)
  }
  const hideArtifacts = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    artifacts,
    updateArtifacts,
    showArtifacts,
    hideArtifacts,
  }
}
