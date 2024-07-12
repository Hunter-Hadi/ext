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
    complete: false,
    content: '',
  },
})
export const ArtifactsOpenState = atom<boolean>({
  key: 'ArtifactsOpenState',
  default: false,
})
