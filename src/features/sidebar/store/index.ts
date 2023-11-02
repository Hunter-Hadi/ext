import { atom } from 'recoil'
import { IChatMessage } from '@/features/chatgpt/types'

export const ChatGPTConversationState = atom<{
  writingMessage: IChatMessage | null
  lastMessageId?: string
  model: string
  loading: boolean
}>({
  key: 'ChatGPTConversationState',
  default: {
    writingMessage: null,
    lastMessageId: '',
    model: '',
    loading: false,
  },
})

const searchParams = new URLSearchParams(window.location.search)
const urlParamConversationType = searchParams.get(
  'conversationType',
) as ISidebarConversationType
// 获取当前 URL 的查询参数
// 移除指定的查询参数
searchParams.delete('conversationType')
// 构建新的 URL，不包含被移除的查询参数
const newUrl = window.location.pathname + '?' + searchParams.toString()

// 使用 history.replaceState() 方法替换当前 URL
history.replaceState(null, '', newUrl)
/**
 * @description - 因为发现页面之间使用的type其实不需要完全同步，例如A页面用Chat类型，B页面用Summary类型，这其实是不用同步的，反而会增加bug
 */
export const SidebarPageState = atom<{
  sidebarConversationType: ISidebarConversationType
}>({
  key: 'SidebarPageState',
  default: {
    sidebarConversationType: urlParamConversationType || 'Chat',
  },
})

export type ISidebarConversationType = 'Chat' | 'Summary' | 'Search'
