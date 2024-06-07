import { atom } from 'recoil'

export const CreateSessionLoadingAtom = atom<boolean>({
  key: 'CreateSessionLoadingAtom',
  default: false,
})
