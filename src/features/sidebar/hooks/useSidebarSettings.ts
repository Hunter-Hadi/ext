import { atom, useRecoilState, useRecoilValue } from 'recoil'
import { AppLocalStorageState } from '@/store'
import { IChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/type'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useMemo } from 'react'
import { ClientConversationMapState } from '@/features/chatgpt/store'
import { ISidebarConversationType } from '@/features/sidebar/store'
import { IChatMessage } from '@/features/chatgpt/types'
import { IChatConversation } from '@/background/src/chatConversations'

/**
 * @description - 因为发现页面之间使用的type其实不需要完全同步，例如A页面用Chat类型，B页面用Summary类型，这其实是不用同步的，反而会增加bug
 */
const SidebarPageState = atom<{
  sidebarConversationType: ISidebarConversationType
}>({
  key: 'SidebarPageState',
  default: {
    sidebarConversationType: 'Chat',
  },
})

const useSidebarSettings = () => {
  const [appLocalStorage, setAppLocalStorage] = useRecoilState(
    AppLocalStorageState,
  )
  const clientConversationMap = useRecoilValue(ClientConversationMapState)
  const [sidebarPageState, setSidebarPageSate] = useRecoilState(
    SidebarPageState,
  )
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
  }
}
export default useSidebarSettings
