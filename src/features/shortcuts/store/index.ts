import { atom } from 'recoil'

export const ShortCutsState = atom<{
  status: 'idle' | 'running' | 'stop' | 'complete'
}>({
  key: 'ShortCutsState',
  default: {
    status: 'idle',
  },
})
