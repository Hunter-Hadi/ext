import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { useMemo, useState } from 'react'
import useEffectOnce from '@/hooks/useEffectOnce'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { useFocus } from '@/hooks/useFocus'

const useFavoriteContextMenuList = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
) => {
  const [favoriteContextMenuList, setFavoriteContextMenus] =
    useState<IContextMenuItem[]>()
  const favoriteContextMenuGroup = useMemo(() => {
    if (!favoriteContextMenuList?.length) {
      return undefined
    }
    const group = {
      id: 'favorite_suggested',
      text: 'Suggested',
      children: (favoriteContextMenuList || []).map((contextMenuItem) => {
        return {
          ...contextMenuItem,
          parent: 'favorite_suggested',
          children: [],
        }
      }),
      parent: 'root',
      droppable: false,
      data: {
        icon: '',
        searchText: 'Suggested',
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
  }, [favoriteContextMenuList])
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
    favoriteContextMenuList,
    favoriteContextMenuGroup,
  }
}
export default useFavoriteContextMenuList
