import { useRecoilState } from 'recoil'
import { ShortcutActionEditorState } from '@/features/shortcuts/components/ShortcutActionsEditor/store'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import {
  IActionSetVariable,
  IActionSetVariablesData,
} from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import {
  escapeHtml,
  promptTemplateToHtml,
} from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

const useShortcutEditorActions = () => {
  const [shortcutActionEditor, setShortcutActionEditor] = useRecoilState(
    ShortcutActionEditorState,
  )
  const { isDarkMode } = useCustomTheme()
  const initActions = (actions: ISetActionsType) => {
    const variables: IActionSetVariablesData = []
    actions.forEach((action) => {
      if (action.parameters.SetVariablesModalConfig?.variables) {
        variables.push(...action.parameters.SetVariablesModalConfig.variables)
      }
    })
    let editHTML = ''
    // 因为这个版本只有一个prompt template，所以html的内容一定在RENDER_TEMPLATE/ASK_CHATGPT/RENDER_CHATGPT_PROMPT/SET_VARIABLES_MODAL
    let originalTemplate = ''
    const templateAction: ActionIdentifier[] = [
      'RENDER_TEMPLATE',
      'ASK_CHATGPT',
      'RENDER_CHATGPT_PROMPT',
      'SET_VARIABLES_MODAL',
    ]
    // 倒序查找
    for (let i = actions.length - 1; i >= 0; i--) {
      const action = actions[i]
      if (templateAction.includes(action.type)) {
        if (action.parameters.template) {
          originalTemplate = action.parameters.template
        } else if (action.parameters.SetVariablesModalConfig?.template) {
          originalTemplate = action.parameters.SetVariablesModalConfig.template
        }
      }
    }
    // 如果找到了template，就把template中的变量替换成html
    if (originalTemplate) {
      const variablesMap = new Map<string, IActionSetVariable>()
      variables.forEach((item) => {
        variablesMap.set(item.VariableName, item)
      })
      editHTML = promptTemplateToHtml(
        escapeHtml(originalTemplate),
        variablesMap,
        isDarkMode,
      )
    }
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        actions,
        editHTML,
        variables,
      }
    })
  }
  const updateEditHTML = (editHTML: string) => {
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        editHTML,
      }
    })
  }
  return {
    actions: shortcutActionEditor.actions,
    setActions: initActions,
    editHTML: shortcutActionEditor.editHTML,
    updateEditHTML,
  }
}

export default useShortcutEditorActions
