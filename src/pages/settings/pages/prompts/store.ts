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

export const EXAMPLE_PROMPT_TEMPLATE_MAPS: Record<
  IChromeExtensionButtonSettingKey,
  string
> = {
  // Context menu
  textSelectPopupButton:
    'Provide writing improvement suggestions for `{{SELECTED_TEXT}}`.',
  // Instant reply
  inputAssistantComposeReplyButton:
    'Express your thanks for the insights provided in {{TARGET_CONTEXT}}, highlighting their value and your appreciation.',
  inputAssistantComposeNewButton:
    "Write a brief message expressing gratitude, including today's date, {{SYSTEM_CURRENT_DATE}}.",
  inputAssistantRefineDraftButton:
    'Based on `{{DRAFT_CONTEXT}}`, offer specific suggestions to enhance clarity, fluency, and engagement in the text.',
  // Summary
  sidebarSummaryButton:
    'Output a summary of the {{PAGE_CONTENT}} on {{CURRENT_WEBSITE_DOMAIN}}.',
}
