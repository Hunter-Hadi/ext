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
import { useRecoilState } from 'recoil'

import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import useUserFeatureQuota from '@/features/auth/hooks/useUserFeatureQuota'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import {
  FloatingContextWindowChangesState,
  useContextMenuList,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import {
  type IInputAssistantButton,
  type IInputAssistantButtonKeyType,
  type IInstantReplyWebsiteType,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import { type IContextMenuItem } from '@/features/contextMenu/types'
import {
  findButtonClickedTrackElement,
  sendMixpanelButtonClickedEvent,
} from '@/features/mixpanel/utils/mixpanelButtonClicked'
import { type IShortcutEngineListenerType } from '@/features/shortcuts'
import { useShortCutsEngine } from '@/features/shortcuts/hooks/useShortCutsEngine'
import { type IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'

interface InputAssistantButtonContextMenuProps {
  root: HTMLElement
  rootId: string
  shadowRoot: ShadowRoot
  buttonKey: IInputAssistantButtonKeyType
  children: React.ReactNode
  permissionWrapperCardSceneType?: PermissionWrapperCardSceneType
  disabled?: boolean
  instantReplyWebsiteType: IInstantReplyWebsiteType
  onSelectionEffect?: IInputAssistantButton['onSelectionEffect']
}

// [Instant reply id, Refine draft id, Compose new id?]
const systemPromptContextMenuMap: Record<
  IInstantReplyWebsiteType,
  Record<IInputAssistantButtonKeyType, string>
> = {
  EMAIL: {
    inputAssistantComposeNewButton: 'c73787fb-e2fd-41f2-8ad0-854b2a624022',
    inputAssistantComposeReplyButton: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    inputAssistantRefineDraftButton: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
  },
  SOCIAL_MEDIA: {
    inputAssistantComposeNewButton: 'fef7401d-ecd3-4bae-94b1-8307cf85fa2f',
    inputAssistantComposeReplyButton: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    inputAssistantRefineDraftButton: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
  },
  CHAT_APP_WEBSITE: {
    inputAssistantComposeNewButton: '',
    inputAssistantComposeReplyButton: 'd77238eb-7673-46c2-a019-5bab341815fe',
    inputAssistantRefineDraftButton: '5962ed83-6526-4665-9d94-5c47bc0b931a',
  },
}

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
    instantReplyWebsiteType,
    onSelectionEffect,
  } = props
  const { floatingDropdownMenuOpen, showFloatingContextMenuWithElement } =
    useFloatingContextMenu()
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )
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
  const { checkFeatureQuota } = useUserFeatureQuota()
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  const hasPermission = useMemo(() => {
    if (permissionWrapperCardSceneType && currentUserPlan.name === 'free') {
      return false
    }
    return true
  }, [permissionWrapperCardSceneType, currentUserPlan])

  const filterContextMenuList = useMemo(() => {
    const filterIds = new Set()
    Object.keys(systemPromptContextMenuMap).forEach((websiteType) => {
      const systemPromptGroupId =
        systemPromptContextMenuMap[websiteType as IInstantReplyWebsiteType][
          buttonKey
        ]
      if (websiteType !== instantReplyWebsiteType && systemPromptGroupId) {
        filterIds.add(systemPromptGroupId)
      }
    })
    return contextMenuList.filter((item) => !filterIds.has(item.id))
  }, [contextMenuList, instantReplyWebsiteType, buttonKey])

  const runContextMenu = useCallback(
    async (contextMenu: IContextMenuItem) => {
      if (!smoothConversationLoading && contextMenu.data.actions) {
        // 每个网站5次免费InputAssistantButton的机会
        // const onBoardingData = await getChromeExtensionOnBoardingData()
        // let key =
        //   `ON_BOARDING_RECORD_INPUT_ASSISTANT_BUTTON_${getCurrentDomainHost()}_TIMES` as OnBoardingKeyType

        // free trail用户判断instant reply使用次数
        // if (userInfo?.role?.name === 'free_trial') {
        //   key = 'ON_BOARDING_RECORD_INSTANT_REPLY_FREE_TRIAL_TIMES'
        // }

        // const currentHostFreeTrialTimes = Number(onBoardingData[key] || 0)

        // 如果没有权限, 显示付费卡片
        if (!hasPermission && permissionWrapperCardSceneType) {
          if (!(await checkFeatureQuota('instant_reply'))) {
            // 如果没有免费试用次数, 则显示付费卡片
            authEmitPricingHooksLog('show', permissionWrapperCardSceneType, {
              conversationId: currentConversationId,
              paywallType: 'RESPONSE',
            })
            await pushPricingHookMessage(permissionWrapperCardSceneType)
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
      currentSidebarConversationType === 'ContextMenu'
    ) {
      if (onSelectionEffect) {
        onSelectionEffectListener = (event, data) => {
          if (
            (data?.action?.type === 'ASK_CHATGPT' &&
              event === 'beforeRunAction') ||
            (event === 'action' &&
              data?.type === 'SET_VARIABLES_MODAL' &&
              data?.status === 'complete')
          ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onSelectionEffect() // 这里会报错只是因为 ts 定义错了，实际使用不会报错，未来可能会根据定义再扩展这个 function
            shortCutsEngine?.removeListener(onSelectionEffectListener!)
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
      clickContextMenu.data.actions?.unshift({
        type: 'SET_VARIABLE',
        parameters: {
          Variable: {
            key: 'MAXAI__INSTANT_REPLY__WEBSITE_TYPE',
            value: instantReplyWebsiteType,
            overwrite: true,
            isBuiltIn: true,
          },
        },
      })
      runContextMenuRef
        .current(clickContextMenu)
        .then()
        .catch()
        .finally(() => {
          isRunningRef.current = false

          if (onSelectionEffectListener) {
            shortCutsEngine?.setActions([])
          }
        })
    }
    return () => {}
  }, [
    clickContextMenu,
    shortCutsEngine,
    currentSidebarConversationType,
    instantReplyWebsiteType,
  ])

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
  const clickContextMenuRef = useRef<IContextMenuItem>()

  useEffect(() => {
    if (!clickContextMenuRef.current) return
    if (!floatingDropdownMenuOpen) {
      // 点击了丢弃，执行新的context menu
      if (
        !contextWindowChanges.discardChangesModalVisible &&
        contextWindowChanges.contextWindowMode === 'READ'
      ) {
        // 这里需要判断丢弃完毕的状态，否则会在showFloatingContextMenuWithVirtualElement里被return掉
        setClickContextMenu(clickContextMenuRef.current)
        clickContextMenuRef.current = undefined
      }
    } else if (!contextWindowChanges.discardChangesModalVisible) {
      // 点击了取消
      clickContextMenuRef.current = undefined
    }
  }, [
    floatingDropdownMenuOpen,
    contextWindowChanges.contextWindowMode,
    contextWindowChanges.discardChangesModalVisible,
  ])

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
        menuList={filterContextMenuList}
        needAutoUpdate
        hoverOpen={false}
        menuWidth={240}
        referenceElement={children}
        // customOpen={disabled}
        // referenceElementOpen={!disabled}
        onClickContextMenu={async (contextMenu) => {
          if (floatingDropdownMenuOpen) {
            // 已经有打开的dropdown menu，先弹窗提醒是否要丢弃
            clickContextMenuRef.current = contextMenu
            setContextWindowChanges((prev) => ({
              ...prev,
              discardChangesModalVisible: true,
            }))
          } else {
            setClickContextMenu(contextMenu)
          }
        }}
        onClickReferenceElement={(e) => {
          // TODO

          // send mixpanel button click event
          const target = e.target as HTMLElement
          const trackElement = findButtonClickedTrackElement(target)
          if (trackElement) {
            const buttonName =
              trackElement.getAttribute('data-button-key') || ''
            sendMixpanelButtonClickedEvent(buttonName, trackElement)
          }
        }}
        hoverIcon={null}
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
