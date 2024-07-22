import { atom } from 'recoil'

import {
  ArtifactsType,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'

export const ArtifactsState = atom<IArtifacts>({
  key: 'ArtifactsState',
  default: {
    identifier: '',
    type: ArtifactsType.TEXT,
    title: '',
    content: '',
    complete: false,
  },
})
export const ArtifactsFloatingWindowState = atom<{
  mode: 'preview' | 'code'
  open: boolean
}>({
  key: 'ArtifactsFloatingWindowState',
  default: {
    mode: 'code',
    open: false,
  },
})
