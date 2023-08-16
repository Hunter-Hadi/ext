import { useRecoilValue } from 'recoil'
import { SidebarConversationMessagesSelector } from '@/features/sidebar'

const useConversationMessages = () => {
  const messages = useRecoilValue(SidebarConversationMessagesSelector)
  return messages
}

export default useConversationMessages
