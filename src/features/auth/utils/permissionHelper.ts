import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import {
  PERMISSION_CARD_SETTINGS_TEMPLATE,
  PermissionWrapperCardSceneType,
  PermissionWrapperI18nCardType,
} from '@/features/auth/components/PermissionWrapper/types'

export const isUsageLimitPermissionSceneType = (sceneType: string): boolean => {
  const API_RESPONSE_USAGE_LIMIT_SCENE_TYPES = [
    'MAXAI_ADVANCED_MODEL',
    'MAXAI_FAST_TEXT_MODEL',
    'MAXAI_IMAGE_GENERATE_MODEL',
    'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
  ]
  if (API_RESPONSE_USAGE_LIMIT_SCENE_TYPES.includes(sceneType)) {
    // 由于 不同模型的用量上限卡点的报错值 是后端直接返回的
    return true
  }
  return false
}

export const isPermissionCardSceneType = (
  sceneType: string,
): sceneType is PermissionWrapperCardSceneType => {
  return Object.keys(PERMISSION_CARD_SETTINGS_TEMPLATE).includes(sceneType)
}

export const getPermissionCardSettingsBySceneType = (
  sceneType: PermissionWrapperCardSceneType,
): PermissionWrapperI18nCardType => {
  return {
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
    ...PERMISSION_CARD_SETTINGS_TEMPLATE[sceneType],
  }
}

/**
 * 需要组合 sceneType + modelType
 * 判断是否是合法的 付费卡点 type，不合法的直接返回 false
 *
 * @param sceneType api 返回的 sceneType （一般为 error.msg）
 * @param modelType api 返回的 modelType （一般为 error.meta.modelType）
 */
export const combinedPermissionSceneType = (
  sceneType?: string,
  modelType?: string,
): PermissionWrapperCardSceneType | false => {
  if (!sceneType) {
    return false
  }
  const combinedSceneType = modelType ? `${sceneType}_${modelType}` : sceneType
  if (isPermissionCardSceneType(combinedSceneType)) {
    return combinedSceneType
  } else if (isPermissionCardSceneType(sceneType)) {
    return sceneType
  } else {
    return false
  }
}
