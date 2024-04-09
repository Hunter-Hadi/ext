import { atom } from 'recoil'

import { type IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type'

export const SettingPromptsEditButtonKeyAtom =
  atom<IChromeExtensionButtonSettingKey | null>({
    key: 'SettingPromptsEditButtonKey',
    default: null,
  })

export const specialInputAssistantButtonKeys: string[] = [
  'inputAssistantComposeReplyButton',
  'inputAssistantComposeNewButton',
  'inputAssistantRefineDraftButton',
]
