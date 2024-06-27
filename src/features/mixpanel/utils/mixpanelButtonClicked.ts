import { buttonBaseClasses } from '@mui/material/ButtonBase'
import { linkClasses } from '@mui/material/Link'
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

// 找到符合 button clicked 条件的元素
export const findButtonClickedTrackElement = (targetElement: HTMLElement) => {
  return (
    findParentEqualSelector(`.${buttonBaseClasses.root}`, targetElement, 10) ||
    findParentEqualSelector(`.${linkClasses.root}`, targetElement, 10) ||
    // 如果 element 上定义了 data-button-clicked-name，代表是需要被 tacker 的元素， 并且把 data-button-clicked-name 作为 buttonName
    findParentEqualSelector(`*[data-button-clicked-name]`, targetElement, 10)
  )
}

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
  sceneType?: IButtonClickedTrackerSceneType,
  propConversationType?: ISidebarConversationType,
) => {
  if (sceneType === 'minimum') {
    return 'quick_access'
  }

  if (sceneType === 'floatingMenu') {
    return 'context_menu'
  }
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
    const featureName = getFeatureNameByElement(
      trackElement,
      params?.sceneType,
      params?.conversationType,
    )

    // console.log(
    //   'sendMixpanelButtonClickedEvent',
    //   trackElement,
    //   buttonName,
    //   buttonPosition,
    //   featureName,
    // )

    mixpanelTrack('button_clicked', {
      productType: 'extension',
      buttonName,
      buttonPosition,
      featureName,
    })
  },
  300,
)
