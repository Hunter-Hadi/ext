import React, { FC, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuSelectedItemState } from '@/features/contextMenu/store'

import { useContextMenuList } from '@/features/contextMenu/hooks/useContextMenuList'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { getAppRootElement } from '@/utils'

const FloatingContextMenuButton: FC = () => {
  const root = getAppRootElement()
  if (!root) {
    return null
  }
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const [running, setRunning] = useState(false)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'contextMenus',
    defaultContextMenuJson,
  )
  useEffect(() => {
    if (
      !running &&
      floatingDropdownMenuSelectedItem.selectedContextMenuId &&
      originContextMenuList.length > 0
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
        setRunning(true)
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
        runShortCuts().then(() => {
          setRunning(false)
        })
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    running,
    originContextMenuList,
  ])
  return <FloatingContextMenuList root={root} menuList={contextMenuList} />
}
export { FloatingContextMenuButton }
