import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import {
  getChromeExtensionContextMenu,
  setChromeExtensionSettings,
} from '@/background/utils'
import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/types'

const forceUpdateContextMenuReadOnlyOption = async () => {
  const updateContextMenuKeys = ['contextMenus', 'gmailToolBarContextMenu']
  const updateContextMenu = async (
    menuType: 'gmailToolBarContextMenu' | 'contextMenus',
  ) => {
    const defaultJsonData =
      menuType === 'gmailToolBarContextMenu'
        ? defaultGmailToolbarContextMenuJson
        : defaultContextMenuJson
    getChromeExtensionContextMenu(menuType).then(async (menuList) => {
      const defaultJsonMap = new Map()
      defaultJsonData.forEach((item) => {
        defaultJsonMap.set(item.id, item)
      })
      let updateCount = 0
      const updateMenuList = menuList.map((item) => {
        if (item.id === 'EzMail_Reply_CTA_Button') {
          item.id = USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID
        }
        if (item.id === 'EzMail_New_Mail_CTA_Button') {
          item.id = USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID
        }
        if (!item.data.editable) {
          // force update
          const defaultItem = defaultJsonMap.get(item.id)
          if (defaultItem) {
            updateCount++
            return {
              ...defaultItem,
              id: item.id,
              parent: item.parent,
            }
          }
        }
        return item
      })
      console.log('force update menu count', updateCount, menuList)
      await setChromeExtensionSettings({
        [menuType]: updateMenuList,
      })
    })
  }
  updateContextMenuKeys.forEach((menuType) => {
    updateContextMenu(menuType as any)
  })
}
export default forceUpdateContextMenuReadOnlyOption
