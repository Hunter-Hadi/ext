import { useRecoilState, useRecoilValue } from 'recoil'
import { AppLocalStorageState } from '@/store'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useMemo } from 'react'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import {
  ISidebarConversationType,
  SidebarPageState,
} from '@/features/sidebar/store'
import { IChatMessage } from '@/features/chatgpt/types'
import { IChatConversation } from '@/background/src/chatConversations'
import useEffectOnce from '@/hooks/useEffectOnce'
import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'

const useSidebarSettings = () => {
  const [appLocalStorage, setAppLocalStorage] = useRecoilState(
    AppLocalStorageState,
  )
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const [sidebarPageState, setSidebarPageSate] = useRecoilState(
    SidebarPageState,
  )

  useEffectOnce(() => {
    const url = new URL(window.location.href)
    const searchParams = new URLSearchParams(url.search)
    const urlParamConversationType = searchParams.get('conversationType')
    if (urlParamConversationType) {
      updateSidebarConversationType(
        urlParamConversationType as ISidebarConversationType,
      )
    }
  })

  const currentSidebarConversationType =
    sidebarPageState.sidebarConversationType
  const currentSidebarAIProvider =
    appLocalStorage.sidebarSettings?.common?.currentAIProvider
  // 当前sidebar conversation type对应的conversation id
  const currentSidebarConversationId = useMemo(() => {
    switch (currentSidebarConversationType) {
      case 'Chat':
        return appLocalStorage.sidebarSettings?.chat?.conversationId
      case 'Search':
        return appLocalStorage.sidebarSettings?.search?.conversationId
      case 'Summary':
        return appLocalStorage.sidebarSettings?.summary?.conversationId
      default:
        return ''
    }
  }, [
    currentSidebarConversationType,
    appLocalStorage.sidebarSettings?.chat?.conversationId,
    appLocalStorage.sidebarSettings?.search?.conversationId,
    appLocalStorage.sidebarSettings?.summary?.conversationId,
  ])
  const sidebarConversationTypeMessageMap = useMemo(() => {
    return {
      Chat:
        clientConversationMap[
          appLocalStorage.sidebarSettings?.chat?.conversationId || ''
        ]?.messages || [],
      Search:
        clientConversationMap[
          appLocalStorage.sidebarSettings?.search?.conversationId || ''
        ]?.messages || [],
      Summary:
        clientConversationMap[
          appLocalStorage.sidebarSettings?.summary?.conversationId || ''
        ]?.messages || [],
    } as {
      [key in ISidebarConversationType]: IChatMessage[]
    }
  }, [
    currentSidebarConversationId,
    appLocalStorage.sidebarSettings?.chat?.conversationId,
    appLocalStorage.sidebarSettings?.search?.conversationId,
    appLocalStorage.sidebarSettings?.summary?.conversationId,
    clientConversationMap,
  ])
  const currentSidebarConversation = useMemo(() => {
    return clientConversationMap[currentSidebarConversationId || ''] as
      | IChatConversation
      | undefined
  }, [currentSidebarConversationId, clientConversationMap])

  // 当前sidebar conversation type对应的messages
  const currentSidebarConversationMessages = useMemo(() => {
    return (
      sidebarConversationTypeMessageMap[currentSidebarConversationType] || []
    )
  }, [currentSidebarConversationType, sidebarConversationTypeMessageMap])
  const updateSidebarSettings = async (
    newSidebarSettings: IChromeExtensionLocalStorage['sidebarSettings'],
  ) => {
    await setChromeExtensionLocalStorage({
      sidebarSettings: newSidebarSettings,
    })
    const savedAppLocalStorage = await getChromeExtensionLocalStorage()
    setAppLocalStorage((prev) => {
      return {
        ...prev,
        sidebarSettings: savedAppLocalStorage.sidebarSettings,
      }
    })
  }
  const updateSidebarConversationType = (
    newSidebarConversationType: ISidebarConversationType,
  ) => {
    setSidebarPageSate((prev) => {
      return {
        ...prev,
        sidebarConversationType: newSidebarConversationType,
      }
    })
  }
  const sidebarBreakpoints = useMemo<'xs' | 'sm' | 'md' | 'lg' | 'xl'>(() => {
    const chatBoxWidth =
      appLocalStorage.sidebarSettings?.common?.chatBoxWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    if (chatBoxWidth <= CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH) {
      return 'xs'
    } else if (chatBoxWidth <= 600) {
      return 'sm'
    } else if (chatBoxWidth <= 960) {
      return 'md'
    } else if (chatBoxWidth <= 1280) {
      return 'lg'
    } else if (chatBoxWidth <= 1920) {
      return 'xl'
    }
    return 'xs'
  }, [appLocalStorage.sidebarSettings?.common?.chatBoxWidth])
  return {
    sidebarSettings: appLocalStorage.sidebarSettings,
    currentSidebarConversationType,
    currentSidebarAIProvider,
    currentSidebarConversation,
    currentSidebarConversationId,
    currentSidebarConversationMessages,
    sidebarConversationTypeMessageMap,
    updateSidebarSettings,
    updateSidebarConversationType,
    sidebarBreakpoints,
  }
}
export default useSidebarSettings