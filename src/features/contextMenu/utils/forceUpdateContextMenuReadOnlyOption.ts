import defaultGmailToolbarContextMenuJson from '@/background/defaultPromptsData/defaultGmailToolbarContextMenuJson'
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import {
  getChromeExtensionButtonContextMenu,
  setChromeExtensionSettings,
} from '@/background/utils'
import {
  isProduction,
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/constants'
import uniqBy from 'lodash-es/uniqBy'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const forceUpdateContextMenuReadOnlyOption = async () => {
  const updateContextButtonKeys: IChromeExtensionButtonSettingKey[] = [
    'gmailButton',
    'textSelectPopupButton',
  ]
  const updateButtonContextMenu = async (
    buttonKey: IChromeExtensionButtonSettingKey,
  ) => {
    const defaultJsonData =
      buttonKey === 'gmailButton'
        ? defaultGmailToolbarContextMenuJson
        : defaultContextMenuJson
    const menuList = await getChromeExtensionButtonContextMenu(buttonKey)
    const defaultJsonMap = new Map()
    defaultJsonData.forEach((item) => {
      defaultJsonMap.set(item.id, item)
    })
    let updateCount = 0
    let updateMenuList = menuList
      .map((item) => {
        if (item.id.includes('Reply_CTA_Button')) {
          item.id = USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID
        }
        if (item.id.includes('New_Mail_CTA_Button')) {
          item.id = USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID
        }
        if (!isProduction) {
          // dev可编辑其他不修改
          item.data.editable = true
          return item
        } else {
          // 如果不能编辑, 强制更新, 如果能找到id, 也强制更新(未来system prompt可能会可以被编辑，就需要删掉这段)
          if (!item.data.editable || defaultJsonMap.has(item.id)) {
            // force update
            const defaultItem = defaultJsonMap.get(item.id)
            if (!defaultItem) {
              // 如果没有默认值，说明已经被删除或者废弃了，不保留
              return null
            }
            if (defaultItem) {
              defaultJsonMap.delete(item.id)
              updateCount++
              return {
                ...defaultItem,
                id: item.id,
              }
            }
          }
          return item
        }
      })
      .filter(Boolean)
    // 如果有新增的，也要更新
    defaultJsonMap.forEach((item) => {
      console.log('add new system prompt', item)
      updateCount++
      // push是因为新增group可以拖动位置
      updateMenuList.push(item)
    })
    updateMenuList = uniqBy(updateMenuList, 'id')
    await setChromeExtensionSettings((settings) => {
      const newButtonSettings = mergeWithObject([
        settings.buttonSettings,
        {
          [buttonKey]: {
            contextMenu: updateMenuList,
          },
        },
      ]) as any
      console.log(
        `force update menu count button: [${buttonKey}]`,
        updateCount,
        updateMenuList,
        newButtonSettings,
      )
      return {
        ...settings,
        buttonSettings: newButtonSettings,
      }
    })
  }
  for (const buttonKey of updateContextButtonKeys) {
    await updateButtonContextMenu(buttonKey)
  }
}
export default forceUpdateContextMenuReadOnlyOption
