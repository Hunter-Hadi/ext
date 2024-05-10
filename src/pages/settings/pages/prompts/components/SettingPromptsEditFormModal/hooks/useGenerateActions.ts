import { cloneDeep } from 'lodash-es'
import { useCallback, useRef } from 'react'

import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import useShortcutEditorActionsVariables, {
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { useSettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'

/**
 * @since 2024-05-09 这里是生成preview的actions，后续需要更改
 * 这一版的preview先统一以chat的形式去运行prompt，目前尽量不修改generateActions的方法，在这里做处理
 */
export const useGeneratePreviewActions = () => {
  const { editNode } = useSettingPromptsEditContext()
  const { editHTML, generateActions } = useShortcutEditorActions()
  const { variables } = useShortcutEditorActionsVariables()

  const generateActionsRef = useRef(generateActions)
  generateActionsRef.current = generateActions

  return useCallback(() => {
    // 先获取到预设的系统变量
    const overrideSystemVariables = Object.values(
      PRESET_VARIABLES_GROUP_MAP,
    ).flatMap((group) =>
      group
        .filter((item) => item.showInPreviewEditor)
        .map((item) => {
          // 这里处理一下label，比如FULL_CONTEXT转换成Full context
          const label = item.variable.label
            ? item.variable.label
                .split('_')
                .map((word, index) =>
                  index === 0
                    ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    : word.toLowerCase(),
                )
                .join(' ')
            : item.variable.label
          return {
            VariableName: item.variable.VariableName,
            valueType: item.variable.valueType,
            label,
            defaultValue: item.previewEditorDefaultValue || label,
          }
        }),
    )
    const actions = generateActionsRef.current(
      editNode.text,
      false,
      overrideSystemVariables,
    )
    // 修改预设的系统变量默认值
    // 防止SET_VARIABLE里设置了强制覆盖的值，导致preview里修改不成功
    const setVariablesModalConfig = actions.find(
      (item) => item.type === 'SET_VARIABLES_MODAL',
    )?.parameters.SetVariablesModalConfig
    if (setVariablesModalConfig?.actions) {
      setVariablesModalConfig.actions = setVariablesModalConfig.actions.filter(
        (item) => {
          if (item.type === 'SET_VARIABLE') {
            if (
              overrideSystemVariables.find(
                (override) =>
                  override.VariableName ===
                  (item.parameters.Variable as any)?.key,
              )
            ) {
              return false
            }
          }
          return true
        },
      )
    }
    return actions
  }, [editNode.text, editHTML, variables])
}

/**
 * 创建逻辑
 */
export const useGenerateSaveActions = () => {
  const { editNode, editButtonKey } = useSettingPromptsEditContext()
  const { editHTML, generateActions } = useShortcutEditorActions()
  const { variables } = useShortcutEditorActionsVariables()

  const generateActionsRef = useRef(generateActions)
  generateActionsRef.current = generateActions

  return useCallback(() => {
    const actions = generateActionsRef.current(
      editNode.text,
      editButtonKey === 'sidebarSummaryButton',
    )
    // Summary custom prompts 需要特殊处理，将输出端转成 AI
    if (editButtonKey === 'sidebarSummaryButton') {
      const askChatGPTAction = actions.find(
        (action) => action.type === 'ASK_CHATGPT',
      )
      if (askChatGPTAction) {
        const originalData = cloneDeep(editNode)
        delete originalData.data.actions
        askChatGPTAction.parameters.AskChatGPTActionQuestion = {
          meta: {
            outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
            contextMenu: originalData,
          },
          text: askChatGPTAction.parameters.template || '',
        }
        askChatGPTAction.parameters.AskChatGPTActionType = 'ASK_CHAT_GPT_HIDDEN'
      }
    }
    return actions
  }, [editNode, editButtonKey, editHTML, variables])
}
