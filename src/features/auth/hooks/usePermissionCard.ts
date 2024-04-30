import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
} from '@/background/src/chat/UseChatGPTChat/types'
import {
  PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST,
  PermissionWrapperCardSceneType,
  PermissionWrapperCardType,
} from '@/features/auth/components/PermissionWrapper/types'
import { getPermissionCardSettingsBySceneType } from '@/features/auth/components/PermissionWrapper/types'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

const isPermissionCardSceneType = (
  sceneType: string,
): sceneType is PermissionWrapperCardSceneType => {
  return PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST.includes(sceneType as any)
}
export const usePermissionCard = (
  sceneType: string,
): PermissionWrapperCardType | null => {
  const { t } = useTranslation(['common', 'client'])
  const { clientConversation } = useClientConversation()
  const { isFreeUser } = useUserInfo()
  return useMemo(() => {
    if (isPermissionCardSceneType(sceneType)) {
      // NOTE: 因为 MAXAI_FAST_TEXT_MODEL 和 MAXAI_ADVANCED_MODEL 有多个子模型，所以需要根据 AIModel 来判断具体的权限卡片
      let settings = getPermissionCardSettingsBySceneType(sceneType)
      const AIModel = clientConversation?.meta?.AIModel
      debugger
      if (AIModel) {
        if (sceneType === 'MAXAI_FAST_TEXT_MODEL') {
          if (AIModel === MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO) {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_FAST_TEXT_MODEL_GPT_3_5_TURBO',
            )
          } else if (AIModel === 'gemini-pro') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_FAST_TEXT_MODEL_GEMINI_PRO',
            )
          } else if (AIModel === 'claude-3-haiku') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_FAST_TEXT_MODEL_CLAUDE_3_HAIKU',
            )
          }
        } else if (sceneType === 'MAXAI_ADVANCED_MODEL') {
          if (AIModel === MAXAI_CHATGPT_MODEL_GPT_4_TURBO) {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_ADVANCED_MODEL_GPT_4_TURBO',
            )
          } else if (AIModel === 'gpt-4') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_ADVANCED_MODEL_GPT_4',
            )
          } else if (AIModel === 'gemini-1.5-pro') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_ADVANCED_MODEL_GEMINI_1_5_PRO',
            )
          } else if (AIModel === 'claude-3-opus') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_ADVANCED_MODEL_CLAUDE_3_OPUS',
            )
          } else if (AIModel === 'claude-3-sonnet') {
            settings = getPermissionCardSettingsBySceneType(
              'MAXAI_ADVANCED_MODEL_CLAUDE_3_SONNET',
            )
          }
        }
      }
      const permissionCard: PermissionWrapperCardType = {
        title: settings.title(t, isFreeUser),
        description: settings.description(t, isFreeUser),
        ctaButtonText: settings.ctaButtonText && settings.ctaButtonText(t),
        ctaButtonLink: settings.ctaButtonLink,
        ctaButtonOnClick: settings.ctaButtonOnClick,
        imageUrl: settings.imageUrl,
        videoUrl: settings.videoUrl,
        sceneType,
      }
      return permissionCard
    } else {
      return null
    }
  }, [sceneType, t, isFreeUser, clientConversation?.meta?.AIModel])
}
export const usePermissionCardMap = (): {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperCardType
} => {
  const { t } = useTranslation(['common', 'client'])
  const { isFreeUser } = useUserInfo()
  return useMemo(() => {
    const permissionCardMap: any = {}
    PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST.forEach((sceneType) => {
      const settings = getPermissionCardSettingsBySceneType(sceneType)
      const permissionCard: PermissionWrapperCardType = {
        title: settings.title(t, isFreeUser),
        description: settings.description(t, isFreeUser),
        ctaButtonText: settings.ctaButtonText && settings.ctaButtonText(t),
        ctaButtonLink: settings.ctaButtonLink,
        ctaButtonOnClick: settings.ctaButtonOnClick,
        imageUrl: settings.imageUrl,
        videoUrl: settings.videoUrl,
        sceneType,
      }
      permissionCardMap[sceneType] = permissionCard
    })
    return permissionCardMap as {
      [key in PermissionWrapperCardSceneType]: PermissionWrapperCardType
    }
  }, [t, isFreeUser])
}
