import { IContextMenuItem } from '@/features/contextMenu/types'
import { useState } from 'react'
import useEffectOnce from '@/hooks/useEffectOnce'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { useFocus } from '@/hooks/useFocus'

const useFavoriteContextMenu = (
  buttonSettingKey: IChromeExtensionButtonSettingKey,
) => {
  const [favoriteContextMenu, setFavoriteContextMenu] =
    useState<IContextMenuItem[]>()
  useEffectOnce(() => {
    FavoriteMediatorFactory.getMediator(buttonSettingKey).subscribe(
      setFavoriteContextMenu,
    )
  })
  useFocus(() => {
    FavoriteMediatorFactory.getMediator(
      buttonSettingKey,
    ).restoreCacheFromLocalStorage()
  })
  useEffectOnce(() => {
    FavoriteMediatorFactory.getMediator(
      buttonSettingKey,
    ).restoreCacheFromLocalStorage()
  })
  return favoriteContextMenu
}
export default useFavoriteContextMenu
