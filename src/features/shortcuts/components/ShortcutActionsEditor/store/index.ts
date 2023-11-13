import { atom } from 'recoil'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'

export const ShortcutActionEditorState = atom<{
  actions: ISetActionsType
  variables: IActionSetVariable[]
  editHTML: string
}>({
  key: 'ShortcutActionEditorState',
  default: {
    actions: [],
    variables: [],
    editHTML: '',
  },
})
