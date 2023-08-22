import {
  PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST,
  PermissionWrapperCardSceneType,
  PermissionWrapperCardType,
} from '@/features/auth/components/PermissionWrapper/types'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { getPermissionCardSettingsBySceneType } from '@/features/auth/components/PermissionWrapper/types'

export const usePermissionCard = (
  sceneType: PermissionWrapperCardSceneType,
): PermissionWrapperCardType => {
  const { t } = useTranslation(['common', 'client'])
  return useMemo(() => {
    const settings = getPermissionCardSettingsBySceneType(sceneType)
    const permissionCard: PermissionWrapperCardType = {
      title: settings.title(t),
      description: settings.description(t),
      ctaButtonText: settings.ctaButtonText(t),
      ctaButtonLink: settings.ctaButtonLink,
      ctaButtonOnClick: settings.ctaButtonOnClick,
      imageUrl: settings.imageUrl,
      videoUrl: settings.videoUrl,
      sceneType,
    }
    return permissionCard
  }, [sceneType, t])
}
export const usePermissionCardMap = (): {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperCardType
} => {
  const { t } = useTranslation(['common', 'client'])
  return useMemo(() => {
    const permissionCardMap: any = {}
    PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST.forEach((sceneType) => {
      const settings = getPermissionCardSettingsBySceneType(sceneType)
      const permissionCard: PermissionWrapperCardType = {
        title: settings.title(t),
        description: settings.description(t),
        ctaButtonText: settings.ctaButtonText(t),
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
  }, [t])
}
