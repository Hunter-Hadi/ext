import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST,
  PermissionWrapperCardSceneType,
  PermissionWrapperCardType,
} from '@/features/auth/components/PermissionWrapper/types'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { getPermissionCardSettingsBySceneType } from '@/features/auth/utils/permissionHelper'

const isPermissionCardSceneType = (
  sceneType: string,
): sceneType is PermissionWrapperCardSceneType => {
  return PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST.includes(sceneType as any)
}
export const usePermissionCard = (
  sceneType: string,
): PermissionWrapperCardType | null => {
  const { t } = useTranslation(['common', 'client'])
  const { isFreeUser } = useUserInfo()
  return useMemo(() => {
    if (isPermissionCardSceneType(sceneType)) {
      const settings = getPermissionCardSettingsBySceneType(sceneType)
      const permissionCard: PermissionWrapperCardType = {
        title: settings.title(t, isFreeUser),
        description: settings.description(t, isFreeUser),
        ctaButtonText: settings.ctaButtonText && settings.ctaButtonText(t),
        ctaButtonLink: settings.ctaButtonLink,
        ctaButtonOnClick: settings.ctaButtonOnClick,
        imageUrl: settings.imageUrl,
        videoUrl: settings.videoUrl,
        modalImageUrl: settings.modalImageUrl,
        sceneType,
      }
      return permissionCard
    } else {
      return null
    }
  }, [sceneType, t, isFreeUser])
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
