import { atom, selector } from 'recoil'
import { ComposeView, InboxSDK, ThreadView } from '@inboxsdk/core'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/types'
import Browser from 'webextension-polyfill'
import { IChatMessage } from '@/features/chatgpt/types'
// import { v4 as uuidV4 } from 'uuid'

interface IProxyInboxSdkTarget<T> {
  getInstance?: () => T
}

export const InboxEditState = atom<{
  currentMessageId?: string
  currentDraftId?: string
  step?: number
}>({
  key: 'InboxEditState',
  default: {},
})

export const InboxSdkState = atom<{
  sdk: InboxSDK | null
  loading: boolean
  initialized: boolean
}>({
  key: 'InboxSdkState',
  default: {
    sdk: null,
    loading: true,
    initialized: false,
  },
})

export const InboxThreadViewState = atom<
  IProxyInboxSdkTarget<ThreadView> & { currentThreadId?: string }
>({
  key: 'InboxThreadViewState',
  default: {
    getInstance: undefined,
    currentThreadId: undefined,
  },
})

export const InboxComposeViewState = atom<{
  [key: string]: IProxyInboxSdkTarget<ComposeView>
}>({
  key: 'InboxComposeViewState',
  default: {},
})

// const radomMarkdownMessages = () => {
//   const text = `# 标题1
// ## 标题2
// ### 标题3

// 这是一段普通的文本。可以使用 *斜体*、**粗体** 或者 ***斜体加粗体*** 来强调。

// 有序列表示例：
// 1. 第一项
// 2. 第二项
// 3. 第三项

// 无序列表示例：
// - 项目一
// - 项目二
// - 项目三

// 链接示例：
// [点击这里](http://example.com) 跳转到示例网站。

// 图片示例：
// ![图片描述](http://example.com/image.jpg)

// 代码示例：
// \`print("Hello, World!")\`

// 代码块示例：

// \`\`\`python
// def greet(name):
//     print("Hello, " + name + "!")
// \`\`\`
// `
//   return new Array(1000).fill('123').map((a, i) => {
//     return {
//       type: i % 2 === 0 ? 'user' : 'ai',
//       text,
//       messageId: uuidV4(),
//       parentMessageId: uuidV4(),
//     } as IChatMessage
//   })
// }

// Browser.storage.local.set({
//   [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify(radomMarkdownMessages()),
// })

export const ChatGPTMessageState = atom<IChatMessage[]>({
  key: CHAT_GPT_MESSAGES_RECOIL_KEY,
  default: [],
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        if (newValue.length > 0) {
          Browser.storage.local
            .set({
              [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify(newValue),
            })
            .then(() => {
              console.log(
                '[ChatGPT Module] [localstorage] message update:\t',
                newValue,
              )
            })
        }
      })
    },
  ],
})

export const ChatGPTConversationState = atom<{
  writingMessage: IChatMessage | null
  conversationId?: string
  lastMessageId?: string
  model: string
  loading: boolean
}>({
  key: 'ChatGPTConversationState',
  default: {
    writingMessage: null,
    conversationId: '',
    lastMessageId: '',
    model: '',
    loading: false,
  },
})

export type IInboxMessageType = 'new-email' | 'reply'

export const CurrentInboxMessageTypeSelector = selector<IInboxMessageType>({
  key: 'CurrentInboxMessageTypeSelector',
  get: ({ get }) => {
    const currentMessageId = get(InboxEditState).currentMessageId
    if (currentMessageId?.includes('newDraft_')) {
      return 'new-email'
    } else {
      return 'reply'
    }
  },
})
