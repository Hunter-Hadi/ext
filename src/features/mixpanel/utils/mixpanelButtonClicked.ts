import debounce from 'lodash-es/debounce'

import { IButtonClickedTrackerSceneType } from '@/features/mixpanel/hooks/useButtonClickedTracker'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { SEARCH_WITH_AI_SHADOW_CONTAINER_ID } from '@/features/searchWithAI/constants'
import { ISidebarConversationType } from '@/features/sidebar/types'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { findParentEqualSelector } from '@/utils/dataHelper/elementHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

// 根据 element 算出 buttonPosition
export const getButtonPositionByElement = (element: HTMLElement) => {
  // header
  // body
  // side_navigation
  let buttonPosition = 'body'

  const inNavigation = findParentEqualSelector(
    `*[id="sidebar-nav"]`,
    element,
    10,
  )
  if (inNavigation) {
    buttonPosition = 'side_navigation'
    return buttonPosition
  }

  const inHeader = findParentEqualSelector(
    `*[id="sidebar-header"]`,
    element,
    10,
  )
  if (inHeader) {
    buttonPosition = 'header'
    return buttonPosition
  }

  buttonPosition = 'body'
  return buttonPosition
}
// 根据 element 和 cache 算出 featureName
export const getFeatureNameByElement = (
  element: HTMLElement,
  propConversationType?: ISidebarConversationType,
) => {
  // 判断 是否在 contextMenu 容器中
  const contextMenuContainer = getMaxAIFloatingContextMenuRootElement()
  if (contextMenuContainer && contextMenuContainer.contains(element)) {
    return 'context_menu'
  }

  // 判断 是否在 instant reply 容器中
  const elementId = element.getAttribute('id')
  if (elementId && elementId.startsWith('maxAIInputAssistant')) {
    const elementButtonKey = element.getAttribute('data-button-key')
    if (elementButtonKey === 'inputAssistantComposeReplyButton') {
      return 'page_instant_reply'
    } else if (elementButtonKey === 'inputAssistantRefineDraftButton') {
      return 'page_instant_refine'
    } else if (elementButtonKey === 'inputAssistantComposeNewButton') {
      return 'page_instant_new'
    }
  }

  // 判断是否在 page summary 容器中
  if (elementId && elementId === 'page-summary-button') {
    return 'page_summarize'
  }

  // 判断是否在 search with ai 容器中
  const searchWithAIContainer = findParentEqualSelector(
    `div[id="${SEARCH_WITH_AI_SHADOW_CONTAINER_ID}"]`,
    element,
    10,
  )
  if (searchWithAIContainer) {
    return 'page_search_with_ai'
  }

  // sidebar 或者 immersive
  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()
  const prefix = isInImmersiveChatPage ? 'immersive' : 'sidebar'
  let suffix = propConversationType
    ? propConversationType.toLowerCase()
    : 'chat'

  if (!propConversationType) {
    const sidebarRoot = getMaxAISidebarRootElement()
    const sidebarChatBox = sidebarRoot?.querySelector('#maxAISidebarChatBox')
    if (sidebarChatBox) {
      const conversationType = sidebarChatBox
        .getAttribute('data-conversation-type')
        ?.toLowerCase()
      if (conversationType) {
        suffix = conversationType
      }
    }
  }

  return `${prefix}_${suffix}`
}

export const sendMixpanelButtonClickedEvent = debounce(
  async (
    buttonName: string,
    trackElement: HTMLElement,
    params?: {
      buttonPosition?: string
      conversationType?: ISidebarConversationType
      sceneType?: IButtonClickedTrackerSceneType
    },
  ) => {
    // get buttonPosition
    const buttonPosition =
      params?.buttonPosition ?? getButtonPositionByElement(trackElement)

    // get featureName
    let featureName = 'sidebar_chat'
    if (params?.sceneType === 'floatingMenu') {
      featureName = 'context_menu'
    } else if (params?.sceneType === 'minimum') {
      featureName = 'quick_access'
    } else {
      featureName = getFeatureNameByElement(
        trackElement,
        params?.conversationType,
      )
    }

    console.log(
      'sendMixpanelButtonClickedEvent',
      trackElement,
      buttonName,
      buttonPosition,
      featureName,
    )

    mixpanelTrack('button_clicked', {
      productType: 'extension',
      buttonName,
      buttonPosition,
      featureName,
    })
  },
  300,
)
