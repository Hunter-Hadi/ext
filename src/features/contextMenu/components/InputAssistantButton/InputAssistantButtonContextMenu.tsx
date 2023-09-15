import React, { FC, useCallback } from 'react'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useContextMenuList } from '@/features/contextMenu'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { IContextMenuItem } from '@/features/contextMenu/types'
import cloneDeep from 'lodash-es/cloneDeep'

interface InputAssistantButtonContextMenuProps {
  root: HTMLElement
  rootId: string
  buttonKey: IChromeExtensionButtonSettingKey
  children: React.ReactNode
}
const InputAssistantButtonContextMenu: FC<
  InputAssistantButtonContextMenuProps
> = (props) => {
  const { buttonKey, children, root, rootId } = props
  const { contextMenuList } = useContextMenuList(buttonKey)
  const { loading } = useRecoilValue(ChatGPTConversationState)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat()
  const runContextMenu = useCallback(
    async (contextMenu: IContextMenuItem) => {
      if (!loading && contextMenu.data.actions) {
        const actions = cloneDeep(contextMenu.data.actions)
        actions.splice(0, 0, {
          type: 'SET_VARIABLE_MAP',
          parameters: {
            VariableMap: {
              OperationElementElementSelector: `[maxai-input-assistant-button-id="${rootId}"]`,
            },
          },
        })
        await setShortCuts(actions)
        await runShortCuts(true)
      }
    },
    [setShortCuts, runShortCuts, loading],
  )
  return (
    <FloatingContextMenuList
      defaultPlacement={'top-start'}
      defaultFallbackPlacements={[
        'top-end',
        'top',
        'bottom-start',
        'bottom-end',
        'bottom',
        'right',
        'left',
      ]}
      root={root}
      menuList={contextMenuList}
      needAutoUpdate
      hoverOpen
      menuWidth={240}
      referenceElement={children}
      onClickContextMenu={runContextMenu}
      onClickReferenceElement={() => {
        // TODO
      }}
    />
  )
}
export default InputAssistantButtonContextMenu
