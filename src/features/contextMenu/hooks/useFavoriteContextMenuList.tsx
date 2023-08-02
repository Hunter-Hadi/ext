import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { useMemo, useState } from 'react'
import useEffectOnce from '@/hooks/useEffectOnce'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { useFocus } from '@/hooks/useFocus'
import cloneDeep from 'lodash-es/cloneDeep'
import { useTranslation } from 'react-i18next'

export const FAVORITE_CONTEXT_MENU_GROUP_ID = 'SUGGESTE'

export const contextMenuIsFavoriteContextMenu = (contextMenuId: string) => {
  return contextMenuId.startsWith(FAVORITE_CONTEXT_MENU_GROUP_ID)
}

export const contextMenuToFavoriteContextMenu = (
  contextMenu: IContextMenuItem,
) => {
  const contextMenuItem = cloneDeep(contextMenu)
  return {
    ...contextMenuItem,
    id: FAVORITE_CONTEXT_MENU_GROUP_ID + contextMenuItem.id,
    parent: FAVORITE_CONTEXT_MENU_GROUP_ID,
  } as IContextMenuItem
}

const useFavoriteContextMenuList = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
) => {
  const { t } = useTranslation(['common', 'client'])
  const [favoriteContextMenuList, setFavoriteContextMenus] = useState<
    IContextMenuItem[]
  >([])
  const currentMenuList = useMemo(() => {
    return cloneDeep(favoriteContextMenuList).map(
      contextMenuToFavoriteContextMenu,
    )
  }, [favoriteContextMenuList])
  const favoriteContextMenuGroup = useMemo(() => {
    if (!favoriteContextMenuList?.length) {
      return undefined
    }
    const group = {
      id: FAVORITE_CONTEXT_MENU_GROUP_ID,
      text: t('client:prompt__group__suggested__title'),
      children: currentMenuList as IContextMenuItemWithChildren[],
      parent: 'root',
      droppable: false,
      data: {
        icon: '',
        searchText: t('client:prompt__group__suggested__title'),
        editable: false,
        type: 'group',
        actions: [],
        visibility: {
          isWhitelistMode: false,
          whitelist: [],
          blacklist: [],
        },
      },
    } as IContextMenuItemWithChildren
    return group
  }, [currentMenuList, t])
  useFocus(() => {
    FavoriteMediatorFactory.getMediator(
      buttonSettingKey,
    ).restoreCacheFromLocalStorage()
  })
  useEffectOnce(() => {
    FavoriteMediatorFactory.getMediator(buttonSettingKey).subscribe(
      setFavoriteContextMenus,
    )
    FavoriteMediatorFactory.getMediator(
      buttonSettingKey,
    ).restoreCacheFromLocalStorage()
  })
  return {
    favoriteContextMenuList: currentMenuList,
    favoriteContextMenuGroup,
  }
}
export default useFavoriteContextMenuList
