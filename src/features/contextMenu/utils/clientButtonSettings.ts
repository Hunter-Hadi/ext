import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'

export const clientGetChromeExtensionButtonSettings = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await clientGetLiteChromeExtensionSettings()
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
