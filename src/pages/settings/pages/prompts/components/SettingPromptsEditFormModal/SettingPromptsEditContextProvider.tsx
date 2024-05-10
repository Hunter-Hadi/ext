import { cloneDeep } from 'lodash-es'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { PRESET_VARIABLES_GROUP_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { SettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

const SettingPromptsContextProvider: FC<{
  node: IContextMenuItem
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
  children: React.ReactNode
}> = ({ node, onSave, onDelete, onCancel, children }) => {
  const { setActions, generateActions } = useShortcutEditorActions()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  const [editNode, setEditNode] = useState(cloneDeep(node))
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey>()

  useEffect(() => {
    const cloneNode: IContextMenuItem = cloneDeep(node)
    // 兼容旧版本，设置默认值
    if (!cloneNode.data.visibility) {
      cloneNode.data.visibility = {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      }
    }
    setEditNode(cloneNode)
    setSelectedIcon(cloneNode.data?.icon as any)
    setActions(cloneNode.data.actions || [])
    // 初始化预设模板
    if (settingPromptsEditButtonKey) {
      // const defaultTemplate =
      //   EXAMPLE_PROMPT_TEMPLATE_MAPS[settingPromptsEditButtonKey]
      // promptTemplateToHtml(defaultTemplate, {})
    }
  }, [node, settingPromptsEditButtonKey])

  const generateActionsRef = useRef(generateActions)
  generateActionsRef.current = generateActions

  /**
   * 创建逻辑
   */
  const generateSaveActions = useCallback(() => {
    const actions = generateActionsRef.current(
      editNode.text,
      settingPromptsEditButtonKey === 'sidebarSummaryButton',
    )
    // Summary custom prompts 需要特殊处理，将输出端转成 AI
    if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
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
  }, [editNode, settingPromptsEditButtonKey])

  /**
   * @since 2024-05-09 这里是生成preview的actions，后续需要更改
   * 这一版的preview先统一以chat的形式去运行prompt，目前尽量不修改generateActions的方法，在这里做处理
   */
  const generatePreviewActions = useCallback(() => {
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
  }, [editNode])

  return (
    <SettingPromptsEditContext.Provider
      value={{
        node,
        editNode,
        editButtonKey: settingPromptsEditButtonKey,
        selectedIcon,
        setEditNode,
        setSelectedIcon,
        generateSaveActions,
        generatePreviewActions,
        onSave,
        onDelete,
        onCancel,
      }}
    >
      {children}
    </SettingPromptsEditContext.Provider>
  )
}
export default SettingPromptsContextProvider
