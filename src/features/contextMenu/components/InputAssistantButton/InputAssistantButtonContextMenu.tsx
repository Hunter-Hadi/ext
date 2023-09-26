import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
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
import { showChatBox } from '@/utils'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'

interface InputAssistantButtonContextMenuProps {
  root: HTMLElement
  rootId: string
  buttonKey: IChromeExtensionButtonSettingKey
  children: React.ReactNode
  permissionWrapperCardSceneType?: PermissionWrapperCardSceneType
}
const InputAssistantButtonContextMenu: FC<InputAssistantButtonContextMenuProps> = (
  props,
) => {
  const {
    buttonKey,
    children,
    rootId,
    root,
    permissionWrapperCardSceneType,
  } = props
  const { currentUserPlan } = useUserInfo()
  const permissionCardMap = usePermissionCardMap()
  const { createConversation } = useClientConversation()
  const { contextMenuList } = useContextMenuList(buttonKey, '', false)
  const { loading } = useRecoilValue(ChatGPTConversationState)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat()
  const emotionCacheRef = useRef<EmotionCache | null>(null)
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
          showChatBox()
          authEmitPricingHooksLog('show', permissionWrapperCardSceneType)
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
  useEffect(() => {
    if (root && rootId && !emotionCacheRef.current) {
      const emotionRoot = document.createElement('style')
      emotionRoot.setAttribute('data-emotion-id', rootId)
      root.appendChild(emotionRoot)
      emotionCacheRef.current = createCache({
        key: `max-ai-input-assistant-context-menu`,
        prepend: true,
        container: emotionRoot,
      })
    }
  }, [root, rootId])
  if (!root || !emotionCacheRef.current) {
    return null
  }
  return (
    <CacheProvider value={emotionCacheRef.current}>
      <FloatingContextMenuList
        defaultPlacement={'bottom-start'}
        defaultFallbackPlacements={[
          'bottom-end',
          'bottom',
          'top-start',
          'top-end',
          'top',
          'right',
          'left',
        ]}
        root={root}
        menuList={contextMenuList}
        needAutoUpdate
        hoverOpen={false}
        menuWidth={240}
        referenceElement={children}
        onClickContextMenu={runContextMenu}
        onClickReferenceElement={() => {
          // TODO
        }}
      />
    </CacheProvider>
  )
}
export default InputAssistantButtonContextMenu
