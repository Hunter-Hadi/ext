import {
  IPresetActionSetVariable,
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'

/**
 * 获取编辑器里需要显示的system variables
 * 用于preview里允许用户编辑的变量
 */
export const getPreviewEditorSystemVariables = (
  showInPreviewEditor = true,
): IPresetActionSetVariable[] => {
  return Object.values(PRESET_VARIABLES_GROUP_MAP).flatMap((group) =>
    group
      .filter(
        (item) => Boolean(item.showInPreviewEditor) === showInPreviewEditor,
      )
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
          defaultValue: item.previewEditorDefaultValue,
        }
      }),
  )
}
