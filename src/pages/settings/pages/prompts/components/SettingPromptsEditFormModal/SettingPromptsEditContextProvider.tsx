import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import useShortcutEditorActionsVariables, {
  PRESET_VARIABLE_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { promptTemplateToHtml } from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { SettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'
import {
  EXAMPLE_PROMPT_TEMPLATE_MAPS,
  SettingPromptsEditButtonKeyAtom,
} from '@/pages/settings/pages/prompts/store'

const SettingPromptsContextProvider: FC<{
  node: IContextMenuItem
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
  children: React.ReactNode
}> = ({ node, onSave, onDelete, onCancel, children }) => {
  const { setActions, updateEditHTML } = useShortcutEditorActions()
  const { setVariables } = useShortcutEditorActionsVariables()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const [editNode, setEditNode] = useState(cloneDeep(node))
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey>()
  // 应该用useForm来做表单验证，因为有些是用之前的逻辑，暂时先这样处理
  const [errors, setErrors] = useState<{
    promptTitle?: boolean
    promptTemplate?: boolean
  }>({})

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
  }, [node])

  useEffect(() => {
    // 初始化预设模板
    if (
      node.data.type === 'shortcuts' &&
      node.id === '' &&
      settingPromptsEditButtonKey &&
      EXAMPLE_PROMPT_TEMPLATE_MAPS[settingPromptsEditButtonKey]
    ) {
      const defaultTemplate =
        EXAMPLE_PROMPT_TEMPLATE_MAPS[settingPromptsEditButtonKey]
      const variablesMap = new Map<string, IActionSetVariable>()
      Object.values(PRESET_VARIABLE_MAP).forEach((presetVariable) => {
        if (defaultTemplate.indexOf(presetVariable.VariableName) > -1) {
          variablesMap.set(presetVariable.VariableName, presetVariable)
        }
      })
      // summary下有一个变量比较特殊, SUMMARY_PAGE_CONTENT_REPRESENTATION
      // 在template里这个显示的是label不是VariableName, 这里先额外单独处理
      // 后续需要考虑修改
      if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
        if (defaultTemplate.indexOf('{{PAGE_CONTENT}}') > -1) {
          variablesMap.set(
            PRESET_VARIABLE_MAP.SUMMARY_PAGE_CONTENT_REPRESENTATION
              .VariableName,
            PRESET_VARIABLE_MAP.SUMMARY_PAGE_CONTENT_REPRESENTATION,
          )
        }
      }
      setVariables(Array.from(variablesMap.values()))
      const defaultHtml = promptTemplateToHtml(defaultTemplate, variablesMap)
      updateEditHTML(defaultHtml)
    }
  }, [node, settingPromptsEditButtonKey])

  return (
    <SettingPromptsEditContext.Provider
      value={{
        node,
        errors,
        editNode,
        editButtonKey: settingPromptsEditButtonKey,
        selectedIcon,
        setEditNode,
        setSelectedIcon,
        setErrors,
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
