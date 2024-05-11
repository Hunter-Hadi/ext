import { cloneDeep } from 'lodash-es'
import { useCallback, useRef } from 'react'

import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import useShortcutEditorActionsVariables from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { useSettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'
import { getPreviewEditorSystemVariables } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/utils'

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
    const overrideSystemVariables = getPreviewEditorSystemVariables()
    const actions = generateActionsRef.current(
      editNode.text,
      false,
      overrideSystemVariables,
    )
    const setVariablesModalConfig = actions.find(
      (item) => item.type === 'SET_VARIABLES_MODAL',
    )?.parameters.SetVariablesModalConfig

    // 修改预设的系统变量默认值
    // 防止SET_VARIABLE里设置了强制覆盖的值，导致preview里修改不成功
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

    // 过滤重复设置的变量
    // 因为已经强制设置了某些变量为系统变量，这里针对可能在variables里出现的重复变量做一遍过滤
    if (setVariablesModalConfig?.variables) {
      setVariablesModalConfig.variables =
        setVariablesModalConfig.variables.filter(
          (variable) =>
            !setVariablesModalConfig.systemVariables.find(
              (systemVariable) =>
                systemVariable.VariableName === variable.VariableName,
            ),
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
