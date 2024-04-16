// {
//   "type": "PROMPT_ACTION",
//   "id": "0607ffb9-e0fb-41b5-9e02-afabff22acb6",
//   "prompt_action_type": "chat_complete",
//   "variables": [
//   {
//     "name": "CURRENT_WEBSITE_DOMAIN",
//     "hint": "The domain of the current website",
//     "type": "text"
//   },
//   {
//     "name": "SELECTED_TEXT",
//     "hint": "The text selected by the user",
//     "type": "text"
//   },
//   {
//     "name": "AI_RESPONSE_LANGUAGE",
//     "hint": "The language preference",
//     "type": "text",
//     "optional": true
//   },
//   {
//     "name": "AI_RESPONSE_WRITING_STYLE",
//     "hint": "The writing style preference",
//     "type": "text",
//     "optional": true
//   },
//   {
//     "name": "AI_RESPONSE_TONE",
//     "hint": "The writing tone preference",
//     "type": "text",
//     "optional": true
//   }
// ],
//   "output": [
//   {
//     "name": "ChatComplete",
//     "hint": "The completion string from the LLM",
//     "type": "text"
//   }
// ]
// }

import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

export type MaxAIPromptActionType = 'chat_complete'
export interface MaxAIPromptActionConfig {
  promptId: string
  promptName: string
  promptActionType: MaxAIPromptActionType
  variables: IActionSetVariable[]
  output: IActionSetVariable[]
}
