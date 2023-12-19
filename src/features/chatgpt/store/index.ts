import { atom } from 'recoil'
import { ChatStatus } from '@/background/provider/chat'
import { IChatConversation } from '@/background/src/chatConversations'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'

export const ChatGPTClientState = atom<{
  loaded: boolean
  status: ChatStatus
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    loaded: false,
    status: 'needAuth',
    aborts: [],
  },
})

export const ClientConversationMapState = atom<{
  [key: string]: IChatConversation
}>({
  key: 'ClientConversationMapState',
  default: {},
})

export const ThirdPartAIProviderConfirmDialogState = atom<{
  open: boolean
  confirmProviderValue: string
  confirmFn?: (provider: AIProviderOptionType) => Promise<void>
}>({
  key: 'ThirdPartAIProviderConfirmDialogState',
  default: {
    open: false,
    // 触发 dialog 的 provider
    confirmProviderValue: '',
    // 确认后 (点击 Continue with) 的回调
    confirmFn: undefined,
  },
})
