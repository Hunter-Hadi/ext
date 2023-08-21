import { useRecoilState } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { useEffect, useRef } from 'react'
import usePageSummary from '@/features/sidebar/hooks/usePageSummary'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { md5TextEncrypt } from '@/utils/encryptionHelper'

const useInitSidebar = () => {
  const { createPageSummary } = usePageSummary()
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const { currentAIProviderDetail, currentAIProviderModelDetail } =
    useAIProviderModels()
  const sidebarTypeRef = useRef(sidebarSettings.type)
  useEffect(() => {
    if (sidebarSettings.type === 'Summary') {
      createPageSummary().then().catch()
    }
    sidebarTypeRef.current = sidebarSettings.type
  }, [sidebarSettings.type])
  useEffect(() => {
    if (!sidebarSettings.summaryConversationId) {
      setTimeout(() => {
        if (sidebarTypeRef.current === 'Summary') {
          createPageSummary().then().catch()
        }
      }, 200)
    }
  }, [sidebarSettings.summaryConversationId])
  useEffect(() => {
    if (currentAIProviderDetail?.value && currentAIProviderModelDetail?.value) {
      const conversationId = md5TextEncrypt(
        currentAIProviderDetail.value + currentAIProviderModelDetail.value,
      )
      setSidebarSettings((prevState) => {
        return {
          ...prevState,
          chatConversationId: conversationId,
        }
      })
    }
  }, [currentAIProviderDetail, currentAIProviderModelDetail])
}
export default useInitSidebar
