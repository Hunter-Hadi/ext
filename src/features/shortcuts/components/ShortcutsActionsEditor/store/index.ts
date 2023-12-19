import { atom } from 'recoil'

import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export const ShortcutActionEditorState = atom<{
  actions: ISetActionsType
  variables: IActionSetVariable[]
  editHTML: string
  enabledAIResponseLanguage: boolean
}>({
  key: 'ShortcutActionEditorState',
  default: {
    actions: [],
    variables: [],
    editHTML: '',
    enabledAIResponseLanguage: true,
  },
})
