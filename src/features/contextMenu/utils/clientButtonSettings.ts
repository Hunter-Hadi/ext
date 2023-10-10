import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'

export const clientGetChromeExtensionButtonSettings = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await clientGetLiteChromeExtensionDBStorage()
  return settings.buttonSettings?.[buttonKey]
}

export const clientGetContextMenuRunActions = async (contextMenuId: string) => {
  // run this prompt
  const fallback = [
    {
      type: 'RENDER_TEMPLATE',
      parameters: {
        template: '{{SELECTED_TEXT}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
      parameters: {},
    },
  ]
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getContextMenuActions',
      data: {
        contextMenuId,
      },
    })
    return result.data || fallback
  } catch (e) {
    console.error(e)
    return fallback
  }
}
