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

import {
  getChromeExtensionOnBoardingData,
  IChromeExtensionButtonSettingKey,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { OnBoardingKeyType } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import {
  useContextMenuList,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { type IInputAssistantButton } from '@/features/contextMenu/components/InputAssistantButton/config'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { type IShortcutEngineListenerType } from '@/features/shortcuts'
import { useShortCutsEngine } from '@/features/shortcuts/hooks/useShortCutsEngine'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

interface InputAssistantButtonContextMenuProps {
  root: HTMLElement
  rootId: string
  shadowRoot: ShadowRoot
  buttonKey: IChromeExtensionButtonSettingKey
  children: React.ReactNode
  permissionWrapperCardSceneType?: PermissionWrapperCardSceneType
  disabled?: boolean
  onSelectionEffect?: IInputAssistantButton['onSelectionEffect']
}

// 会触发 onSelectionEffect 的 actions
const selectionEffectActions = new Set([
  // instant reply
  'GET_CONTENTS_OF_WEBPAGE',
  'GET_EMAIL_CONTENTS_OF_WEBPAGE',
  'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
  'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
  // refine draft
  'GET_EMAIL_DRAFT_OF_WEBPAGE'
])

const InputAssistantButtonContextMenu: FC<
  InputAssistantButtonContextMenuProps
> = (props) => {
  const {
    buttonKey,
    children,
    rootId,
    root,
    shadowRoot,
    permissionWrapperCardSceneType,
    disabled,
    onSelectionEffect,
  } = props
  const { showFloatingContextMenuWithElement, hideFloatingContextMenu } =
    useFloatingContextMenu()
  const { updateSidebarConversationType } = useSidebarSettings()
  const [clickContextMenu, setClickContextMenu] =
    useState<IContextMenuItem | null>(null)
  const { currentSidebarConversationType, currentConversationId } =
    useClientConversation()
  const { currentUserPlan } = useUserInfo()
  const { shortCutsEngine } = useShortCutsEngine()
  const { pushPricingHookMessage } = useClientConversation()
  const { contextMenuList } = useContextMenuList(buttonKey, '', false)
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { askAIWIthShortcuts } = useClientChat()
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  const hasPermission = useMemo(() => {
    if (permissionWrapperCardSceneType && currentUserPlan.name === 'free') {
      return false
    }
    return true
  }, [permissionWrapperCardSceneType, currentUserPlan])
  const runContextMenu = useCallback(
    async (contextMenu: IContextMenuItem) => {
      if (!smoothConversationLoading && contextMenu.data.actions) {
        // 每个网站5次免费InputAssistantButton的机会
        const onBoardingData = await getChromeExtensionOnBoardingData()
        const key =
          `ON_BOARDING_RECORD_INPUT_ASSISTANT_BUTTON_${getCurrentDomainHost()}_TIMES` as OnBoardingKeyType
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
            // 2024-04-30 付费卡点在当前context window里显示，没问题可以删除注释及代码
            // 如果没有免费试用次数, 则显示付费卡片
            // showChatBox()
            authEmitPricingHooksLog('show', permissionWrapperCardSceneType, {
              conversationId: currentConversationId,
            })
            // updateSidebarConversationType('Chat')
            await pushPricingHookMessage(permissionWrapperCardSceneType)
            // hideFloatingContextMenu()
            return
          }
        }
        const actions = cloneDeep(contextMenu.data.actions)
        actions.splice(0, 0, {
          type: 'SET_VARIABLE_MAP',
          parameters: {
            VariableMap: {
              OperationElementSelector: {
                key: 'OperationElementSelector',
                value: `[maxai-input-assistant-button-id="${rootId}"]`,
                isBuiltIn: true,
              } as IShortCutsParameter,
            },
          },
        })
        await askAIWIthShortcuts(actions)
      }
    },
    [
      rootId,
      askAIWIthShortcuts,
      smoothConversationLoading,
      hasPermission,
      permissionWrapperCardSceneType,
      currentConversationId,
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
    let onSelectionEffectListener: IShortcutEngineListenerType | null = null
    if (
      !isRunningRef.current &&
      clickContextMenu &&
      runContextMenuRef.current &&
      sidebarSettingsTypeRef.current === 'ContextMenu'
    ) {
      if (onSelectionEffect) {
        onSelectionEffectListener = (event, data) => {
          if (
            event === 'action' &&
            data?.status === 'complete' &&
            (
              selectionEffectActions.has(data?.type) ||
              (data?.type === 'SET_VARIABLES_MODAL' && data?.parameters?.MaxAIPromptActionConfig?.promptName === 'Compose with key points') // compose new
            )
          ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onSelectionEffect() // 这里会报错只是因为 ts 定义错了，实际使用不会报错，未来可能会根据定义再扩展这个 function
          }
        }
        shortCutsEngine?.addListener(onSelectionEffectListener)
      }
      isRunningRef.current = true
      setClickContextMenu(null)
      const buttonElement = (document.querySelector(
        `[maxai-input-assistant-button-id="${rootId}"]`,
      ) || shadowRoot?.host) as HTMLElement
      if (buttonElement) {
        showFloatingContextMenuWithElement(buttonElement, '', true)
      }
      runContextMenuRef
        .current(clickContextMenu)
        .then()
        .catch()
        .finally(() => {
          isRunningRef.current = false

          if (onSelectionEffectListener) {
            shortCutsEngine?.removeListener(onSelectionEffectListener)
            shortCutsEngine?.setActions([])
          }
          // temporary support onSelectionEffect
          // onSelectionEffect && onSelectionEffect();
        })
    }
    return () => { }
  }, [clickContextMenu, shortCutsEngine])
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
        // customOpen={disabled}
        // referenceElementOpen={!disabled}
        onClickContextMenu={async (contextMenu) => {
          setClickContextMenu(contextMenu)
        }}
        onClickReferenceElement={() => {
          // TODO
        }}
        {...(disabled
          ? {
            customOpen: true,
            referenceElementOpen: false,
          }
          : {})}
      />
    </CacheProvider>
  )
}
export default InputAssistantButtonContextMenu
