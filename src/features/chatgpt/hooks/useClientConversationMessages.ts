import { useRecoilValue } from 'recoil'
import { SidebarConversationMessagesSelector } from '@/features/sidebar'

const useClientConversationMessages = () => {
  const messages = useRecoilValue(SidebarConversationMessagesSelector)
  return messages
}

export default useClientConversationMessages
