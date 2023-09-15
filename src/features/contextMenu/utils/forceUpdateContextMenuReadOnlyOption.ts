import {
  getChromeExtensionButtonContextMenu,
  setChromeExtensionSettings,
} from '@/background/utils'
import uniqBy from 'lodash-es/uniqBy'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { IContextMenuItem } from '@/features/contextMenu/types'
import lodashSet from 'lodash-es/set'
import cloneDeep from 'lodash-es/cloneDeep'
import getNeedRemovePromptIdsMap from '@/background/defaultPromptsData/getNeedRemovePromptIdsMap'

/**
 * @version 2.0 - 移除所有不可编辑的system prompt
 * @since 2.0 - 2023-08-15
 */
const forceUpdateContextMenuReadOnlyOption = async () => {
  const updateContextButtonKeys: IChromeExtensionButtonSettingKey[] = [
    'inputAssistantReplyButton',
    'textSelectPopupButton',
  ]
  const updateButtonContextMenu = async (
    buttonKey: IChromeExtensionButtonSettingKey,
  ) => {
    const menuList = await getChromeExtensionButtonContextMenu(buttonKey)
    const needRemoveMenuIdMap = getNeedRemovePromptIdsMap()
    const updateCount = 0
    let updateMenuList = menuList
      .map((item) => {
        if (!item.data.editable || needRemoveMenuIdMap.get(item.id)) {
          return null
        }
        return item
      })
      .filter(Boolean) as IContextMenuItem[]
    updateMenuList = uniqBy(updateMenuList, 'id')
    if (buttonKey === 'inputAssistantReplyButton') {
      // NOTE gmail 目前没有编辑权限
      updateMenuList = []
    }
    const contextMenuIdMap: {
      [key: string]: string
    } = {}
    updateMenuList.forEach((item) => {
      contextMenuIdMap[item.id] = item.id
    })
    updateMenuList = updateMenuList.map((item) => {
      // 因为移除了不可编辑的system prompt，所以有些contextMenu的parentId可能会找不到
      if (contextMenuIdMap[item.parent]) {
        return item
      } else {
        item.parent = 'root'
        return item
      }
    })
    await setChromeExtensionSettings((settings) => {
      const newSettings = cloneDeep(settings)
      lodashSet(
        newSettings,
        `buttonSettings.${buttonKey}.contextMenu`,
        updateMenuList,
      )
      console.log(
        `force update menu count button: [${buttonKey}]`,
        updateCount,
        updateMenuList,
        newSettings.buttonSettings?.[buttonKey].contextMenu,
      )
      return newSettings
    })
  }
  for (const buttonKey of updateContextButtonKeys) {
    await updateButtonContextMenu(buttonKey)
  }
}
export default forceUpdateContextMenuReadOnlyOption
