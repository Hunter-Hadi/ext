import React, { FC, useCallback, useMemo } from 'react'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useContextMenuList } from '@/features/contextMenu'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { IContextMenuItem } from '@/features/contextMenu/types'
import cloneDeep from 'lodash-es/cloneDeep'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import {
  getPermissionCardMessageByPermissionCardSettings,
  PermissionWrapperCardSceneType,
} from '@/features/auth/components/PermissionWrapper/types'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'

interface InputAssistantButtonContextMenuProps {
  root: HTMLElement
  rootId: string
  buttonKey: IChromeExtensionButtonSettingKey
  children: React.ReactNode
  permissionWrapperCardSceneType?: PermissionWrapperCardSceneType
}
const InputAssistantButtonContextMenu: FC<
  InputAssistantButtonContextMenuProps
> = (props) => {
  const { buttonKey, children, root, rootId, permissionWrapperCardSceneType } =
    props
  const { currentUserPlan } = useUserInfo()
  const permissionCardMap = usePermissionCardMap()
  const { createConversation } = useClientConversation()
  const { contextMenuList } = useContextMenuList(buttonKey)
  const { loading } = useRecoilValue(ChatGPTConversationState)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat()
  const hasPermission = useMemo(() => {
    if (permissionWrapperCardSceneType && currentUserPlan.name === 'free') {
      return false
    }
    return true
  }, [permissionWrapperCardSceneType, currentUserPlan])
  const runContextMenu = useCallback(
    async (contextMenu: IContextMenuItem) => {
      if (!loading && contextMenu.data.actions) {
        // 如果没有权限，显示付费卡片
        if (!hasPermission && permissionWrapperCardSceneType) {
          const conversationId = await createConversation()
          await clientChatConversationModifyChatMessages(
            'add',
            conversationId,
            0,
            [
              getPermissionCardMessageByPermissionCardSettings(
                permissionCardMap[permissionWrapperCardSceneType],
              ),
            ],
          )
          return
        }
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
    [
      setShortCuts,
      runShortCuts,
      loading,
      hasPermission,
      permissionWrapperCardSceneType,
    ],
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
