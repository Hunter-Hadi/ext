import debounce from 'lodash-es/debounce'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER } from '@/features/searchWithAI/constants'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'

/**
 * 将 PermissionWrapperCardSceneType 根据不同场景和配置转换成 logType
 */
const permissionSceneTypeToLogType = async (
  sceneType: PermissionWrapperCardSceneType,
): Promise<string> => {
  let name: string = sceneType
  // summary
  if (sceneType === 'PAGE_SUMMARY') {
    const pageSummaryType = getPageSummaryType()
    name = 'SUMMARY'
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
    return name
  }

  // gmail instant reply
  if (
    sceneType.includes('GMAIL_CONTEXT_MENU') ||
    sceneType.includes('GMAIL_DRAFT_BUTTON') ||
    sceneType.includes('GMAIL_REPLY_BUTTON')
  ) {
    switch (sceneType) {
      case 'GMAIL_CONTEXT_MENU':
        name = 'INSTANT_REPLY(REFINE)'
        break
      case 'GMAIL_DRAFT_BUTTON':
        name = 'INSTANT_REPLY(COMPOSE)'
        break
      case 'GMAIL_REPLY_BUTTON':
        name = 'INSTANT_REPLY(REPLY)'
        break
      default:
        break
    }
    return name
  }
  // instant reply
  // 判断是否是 instant reply 付费卡点

  if (
    sceneType.includes('REFINE_DRAFT_BUTTON') ||
    sceneType.includes('COMPOSE_NEW_BUTTON') ||
    sceneType.includes('COMPOSE_REPLY_BUTTON')
  ) {
    name = 'INSTANT_REPLY'
    if (sceneType.includes('COMPOSE_REPLY_BUTTON')) {
      name += '(REPLY)'
      return name
    }
    if (sceneType.includes('REFINE_DRAFT_BUTTON')) {
      name += '(REFINE)'
      return name
    }
    if (sceneType.includes('COMPOSE_NEW_BUTTON')) {
      name += '(COMPOSE)'
      return name
    }
  }

  // search with ai maxai_claude
  if (sceneType === 'SEARCH_WITH_AI_CLAUDE') {
    return `SEARCH_WITH_AI(${SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER['MAXAI_CLAUDE']})`
  }
  // search with ai chatgpt
  if (sceneType === 'SEARCH_WITH_AI_CHATGPT') {
    return `SEARCH_WITH_AI(${SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER['USE_CHAT_GPT_PLUS']})`
  }

  const { sidebarSettings, thirdProviderSettings } =
    await getChromeExtensionLocalStorage()

  // sidebar search
  if (sceneType === 'SIDEBAR_SEARCH_WITH_AI') {
    name = 'SEARCH'
    name += sidebarSettings?.search?.copilot ? '(PRO)' : '(QUICK)'
    return name
  }
  const currentProvider = sidebarSettings?.common?.currentAIProvider || ''
  const currentModelName =
    currentProvider && thirdProviderSettings
      ? thirdProviderSettings[currentProvider]?.model ?? ''
      : ''

  // Fast Text Model
  if (sceneType === 'MAXAI_FAST_TEXT_MODEL') {
    name = `FAST_TEXT_MODEL(${currentModelName})`
    return name
  }

  // Advanced Text Model
  if (sceneType === 'MAXAI_ADVANCED_MODEL') {
    name = `ADVANCED_TEXT_MODEL(${currentModelName})`
    return name
  }

  // Image Model
  if (
    sceneType === 'SIDEBAR_ART_AND_IMAGES' ||
    sceneType === 'MAXAI_IMAGE_MODEL' ||
    sceneType === 'TOTAL_CHAT_DAILY_LIMIT' // 为了兼容api 返回错误的 SceneType
  ) {
    name = `IMAGE_MODEL(${currentModelName})`
    return name
  }

  if (sceneType === 'THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT') {
    const thirdPartyProviderName = AIProviderOptions.find(
      (providerOption) => providerOption.value === currentProvider,
    )?.label
    name = `FAST_TEXT_MODEL(${currentModelName} ${thirdPartyProviderName})`
  }

  return name
}

export const authEmitPricingHooksLog = debounce(
  async (
    action: 'show' | 'click',
    sceneType: PermissionWrapperCardSceneType,
  ) => {
    try {
      const logType = await permissionSceneTypeToLogType(sceneType)

      const port = new ContentScriptConnectionV2()
      await port.postMessage({
        event: 'Client_emitPricingHooks',
        data: {
          action,
          name: logType,
        },
      })
    } catch (e) {
      console.log('emitPricingHooksLog error', e)
    }
  },
  1000,
)
