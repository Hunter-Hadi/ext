import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'

export const authEmitPricingHooksLog = async (
  action: 'show' | 'click',
  sceneType: PermissionWrapperCardSceneType,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    await port.postMessage({
      event: 'Client_emitPricingHooks',
      data: {
        action,
        name: sceneType,
      },
    })
  } catch (e) {
    console.log('emitPricingHooksLog error', e)
  }
}
