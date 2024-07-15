import { atom } from 'recoil'

export interface IArtifacts {
  identifier: string
  type: string
  title: string
  content: string
  complete: boolean
}

export const ArtifactsState = atom<IArtifacts>({
  key: 'ArtifactsState',
  default: {
    identifier: '',
    type: '',
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
