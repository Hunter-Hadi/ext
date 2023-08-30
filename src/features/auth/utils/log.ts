import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import debounce from 'lodash-es/debounce'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'

export const authEmitPricingHooksLog = debounce(
  async (
    action: 'show' | 'click',
    sceneType: PermissionWrapperCardSceneType,
  ) => {
    try {
      let name = sceneType
      if (sceneType === 'PAGE_SUMMARY') {
        const pageSummaryType = getPageSummaryType()
        switch (pageSummaryType) {
          case 'PDF_CRX_SUMMARY':
            name += '(PDF)'
            break
          case 'PAGE_SUMMARY':
            name += '(DEFAULT)'
            break
          case 'YOUTUBE_VIDEO_SUMMARY':
            name += '(YOUTUBE)'
            break
          case 'DEFAULT_EMAIL_SUMMARY':
            name += '(EMAIL)'
            break
          default:
            break
        }
      }
      const port = new ContentScriptConnectionV2()
      await port.postMessage({
        event: 'Client_emitPricingHooks',
        data: {
          action,
          name,
        },
      })
    } catch (e) {
      console.log('emitPricingHooksLog error', e)
    }
  },
  1000,
)
