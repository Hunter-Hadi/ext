import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import cloneDeep from 'lodash-es/cloneDeep'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRecoilValue } from 'recoil'

import {
  getChromeExtensionOnBoardingData,
  IChromeExtensionButtonSettingKey,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { OnBoardingKeyType } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import {
  permissionCardToChatMessage,
  PermissionWrapperCardSceneType,
} from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { useContextMenuList } from '@/features/contextMenu'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { showChatBox } from '@/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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
  const [
    clickContextMenu,
    setClickContextMenu,
  ] = useState<IContextMenuItem | null>(null)
  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()
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
        // 每个网站5次免费InputAssistantButton的机会
        const onBoardingData = await getChromeExtensionOnBoardingData()
        const key = `ON_BOARDING_RECORD_INPUT_ASSISTANT_BUTTON_${getCurrentDomainHost()}_TIMES` as OnBoardingKeyType
        const currentHostFreeTrialTimes = Number(onBoardingData[key] || 0)
        // 如果没有权限, 显示付费卡片
        if (!hasPermission && permissionWrapperCardSceneType) {
          if (currentHostFreeTrialTimes > 0) {
            // 如果有免费试用次数, 则减少一次
            await setChromeExtensionOnBoardingData(
              key,
              currentHostFreeTrialTimes - 1,
            )
          } else {
            // 如果没有免费试用次数, 则显示付费卡片
            showChatBox()
            authEmitPricingHooksLog('show', permissionWrapperCardSceneType)
            const conversationId = await createConversation()
            await clientChatConversationModifyChatMessages(
              'add',
              conversationId,
              0,
              [
                permissionCardToChatMessage(
                  permissionCardMap[permissionWrapperCardSceneType],
                ),
              ],
            )
            return
          }
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
  const runContextMenuRef = useRef(runContextMenu)
  useEffect(() => {
    runContextMenuRef.current = runContextMenu
  }, [runContextMenu])
  const isRunningRef = useRef(false)
  const sidebarSettingsTypeRef = useRef(currentSidebarConversationType)
  useEffect(() => {
    sidebarSettingsTypeRef.current = currentSidebarConversationType
  }, [currentSidebarConversationType])
  useEffect(() => {
    if (
      !isRunningRef.current &&
      clickContextMenu &&
      runContextMenuRef.current &&
      sidebarSettingsTypeRef.current === 'Chat'
    ) {
      isRunningRef.current = true
      setClickContextMenu(null)
      runContextMenuRef
        .current(clickContextMenu)
        .then()
        .catch()
        .finally(() => {
          isRunningRef.current = false
        })
    }
  }, [clickContextMenu])
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
        onClickContextMenu={async (contextMenu) => {
          updateSidebarConversationType('Chat')
          setClickContextMenu(contextMenu)
        }}
        onClickReferenceElement={() => {
          // TODO
        }}
      />
    </CacheProvider>
  )
}
export default InputAssistantButtonContextMenu
