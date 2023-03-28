import React, { FC, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import {
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'

import { useContextMenuList } from '@/features/contextMenu/hooks/useContextMenuList'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { getAppRootElement } from '@/utils'

const FloatingContextMenuButton: FC = () => {
  const root = getAppRootElement()
  const [floatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const { setShortCuts, runShortCuts, loading } =
    useShortCutsWithMessageChat('')
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'contextMenus',
    defaultContextMenuJson,
  )
  useEffect(() => {
    /**
     * @description
     * 1. 必须有选中的id
     * 2. 必须有子菜单
     * 3. contextMenu必须是关闭状态
     * 4. 必须不是loading
     */
    if (
      floatingDropdownMenuSelectedItem.selectedContextMenuId &&
      originContextMenuList.length > 0 &&
      !floatingDropdownMenu.open &&
      !loading
    ) {
      const findContextMenu = originContextMenuList.find(
        (contextMenu) =>
          contextMenu.id ===
          floatingDropdownMenuSelectedItem.selectedContextMenuId,
      )
      if (
        findContextMenu &&
        findContextMenu.data.actions &&
        findContextMenu.data.actions.length > 0
      ) {
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
          }
        })
        setShortCuts(
          findContextMenu.data.actions.map((action) => {
            if (action.type === 'RENDER_CHATGPT_PROMPT') {
              return {
                ...action,
                parameters: {
                  ...action.parameters,
                  template: (action.parameters?.template || '').replace(
                    /\{\{HIGHLIGHTED_TEXT\}\}/g,
                    '{{LAST_MESSAGE_OUTPUT}}',
                  ),
                },
              }
            }
            return action
          }),
        )
        runShortCuts().then()
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    floatingDropdownMenu.open,
    originContextMenuList,
    loading,
  ])
  if (!root) {
    return null
  }
  return <FloatingContextMenuList root={root} menuList={contextMenuList} />
}
export { FloatingContextMenuButton }
