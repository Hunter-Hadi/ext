import { atomFamily } from 'recoil'

export const chatMessageAttachmentStateFamily = atomFamily<
  {
    loaded: boolean
    fileUpdating: boolean
  },
  string
>({
  key: 'chatMessageAttachmentStateFamily',
  default: {
    loaded: false,
    fileUpdating: false,
  },
})
