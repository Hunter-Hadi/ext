import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  ClaudeChatProvider,
  IAIProviderType,
  MaxAIClaudeChatProvider,
  MaxAIDALLEChatProvider,
  MaxAIFreeChatProvider,
  MaxAIGeminiChatProvider,
  OpenAIApiChatProvider,
  OpenAIChatProvider,
  PoeChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import { BardChat } from '@/background/src/chat/BardChat'
import { BingChat } from '@/background/src/chat/BingChat'
import { ClaudeWebappChat } from '@/background/src/chat/ClaudeWebappChat'
import { MaxAIClaudeChat } from '@/background/src/chat/MaxAIClaudeChat'
import { MaxAIDALLEChat } from '@/background/src/chat/MaxAIDALLEChat'
import { MaxAIFreeChat } from '@/background/src/chat/MaxAIFreeChat'
import { MaxAIGeminiChat } from '@/background/src/chat/MaxAIGeminiChat'
import { OpenAiApiChat } from '@/background/src/chat/OpenAIApiChat'
import { OpenAIChat } from '@/background/src/chat/OpenAIChat'
import { updateRemoteAIProviderConfigAsync } from '@/background/src/chat/OpenAIChat/utils'
import { PoeChat } from '@/background/src/chat/PoeChat'
import { UseChatGPTPlusChat } from '@/background/src/chat/UseChatGPTChat'
import { processAskAIParameters } from '@/background/src/chat/util'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { createBackgroundMessageListener } from '@/background/utils'
import { AI_PROVIDER_MAP } from '@/constants'
import { IChatUploadFile, IUserChatMessage } from '@/features/chatgpt/types'

import { ChatSystem } from './ChatSystem'

export default class ChatSystemFactory {
  chatSystemMap: Map<string, ChatSystem> = new Map()

  createChatSystem = () => {
    const chatSystem = new ChatSystem()
    const openAIChatAdapter = new ChatAdapter(
      new OpenAIChatProvider(new OpenAIChat()),
    )
    const useChatGPTPlusAdapter = new ChatAdapter(
      new UseChatGPTPlusChatProvider(new UseChatGPTPlusChat()),
    )
    const newOpenAIApiChatAdapter = new ChatAdapter(
      new OpenAIApiChatProvider(new OpenAiApiChat()),
    )
    const bardChatAdapter = new ChatAdapter(
      new BardChatProvider(new BardChat()),
    )
    const bingChatAdapter = new ChatAdapter(
      new BingChatProvider(new BingChat()),
    )
    const poeChatAdapter = new ChatAdapter(new PoeChatProvider(new PoeChat()))
    const claudeChatAdapter = new ChatAdapter(
      new ClaudeChatProvider(new ClaudeWebappChat()),
    )
    const maxAIClaudeAdapter = new ChatAdapter(
      new MaxAIClaudeChatProvider(new MaxAIClaudeChat()),
    )
    const maxAIGeminiAdapter = new ChatAdapter(
      new MaxAIGeminiChatProvider(new MaxAIGeminiChat()),
    )
    const maxAIArtAdapter = new ChatAdapter(
      new MaxAIDALLEChatProvider(new MaxAIDALLEChat()),
    )
    const maxAiFreeAdapter = new ChatAdapter(
      new MaxAIFreeChatProvider(new MaxAIFreeChat()),
    )
    chatSystem.addAdapter(AI_PROVIDER_MAP.OPENAI, openAIChatAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.OPENAI_API, newOpenAIApiChatAdapter)
    chatSystem.addAdapter(
      AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
      useChatGPTPlusAdapter,
    )
    chatSystem.addAdapter(AI_PROVIDER_MAP.BING, bingChatAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.BARD, bardChatAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.POE, poeChatAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.CLAUDE, claudeChatAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_CLAUDE, maxAIClaudeAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_FREE, maxAiFreeAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_GEMINI, maxAIGeminiAdapter)
    chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_DALLE, maxAIArtAdapter)
    return chatSystem
  }
  constructor() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
        if (!data.conversationId) {
          return
        }
        let currentChatSystem = this.chatSystemMap.get(data.conversationId)
        if (!currentChatSystem) {
          currentChatSystem = this.createChatSystem()
          this.chatSystemMap.set(data.conversationId, currentChatSystem)
        }
        switch (event) {
          case 'Client_AuthAIProvider': {
            const { provider } = data
            const needAuthAIProvider =
              currentChatSystem.adapters[provider as IAIProviderType]
            await needAuthAIProvider?.auth(sender.tab?.id || 0)
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          case 'Client_checkChatGPTStatus': {
            debugger
            return {
              success: true,
              data: {
                status: currentChatSystem.status,
              },
              message: '',
            }
          }
          case 'Client_createChatGPTConversation': {
            const initConversationData = (data.initConversationData ||
              {}) as IChatConversation
            console.log('新版Conversation 创建会话', initConversationData)
            if (
              initConversationData.meta.AIProvider &&
              currentChatSystem.currentProvider !==
                initConversationData.meta.AIProvider
            ) {
              await currentChatSystem.switchAdapter(
                initConversationData.meta.AIProvider,
              )
            }
            const conversationId = await currentChatSystem.createConversation(
              initConversationData || {},
            )
            if (conversationId) {
              return {
                success: true,
                data: {
                  conversationId,
                },
                message: '',
              }
            } else {
              return {
                success: false,
                data: {
                  conversationId,
                },
                message: 'create conversation failed',
              }
            }
          }
          case 'Client_changeConversation': {
            const { conversationId } = data
            if (conversationId) {
              const conversation =
                await ConversationManager.conversationDB.getConversationById(
                  conversationId,
                )
              if (conversation) {
                await currentChatSystem.switchAdapterWithConversation(
                  conversation,
                )
                return {
                  success: true,
                  data: {
                    conversationId,
                  },
                }
              }
            }
            return {
              success: false,
              data: {},
              message: '',
            }
          }
          case 'Client_askChatGPTQuestion':
            {
              // 每次提问的时候尝试更新一下model的白名单
              updateRemoteAIProviderConfigAsync().then().catch()
              const taskId = data.taskId
              const question = data.question as IUserChatMessage
              console.log('新版Conversation 提问', question)
              if (question.conversationId) {
                const conversation =
                  await ConversationManager.conversationDB.getConversationById(
                    question.conversationId,
                  )
                if (conversation) {
                  // 如果会话存在，但是AIProvider不一致，需要切换AIProvider
                  if (
                    conversation?.meta?.AIProvider &&
                    conversation.meta.AIProvider !==
                      currentChatSystem.currentProvider
                  ) {
                    await currentChatSystem.switchAdapterWithConversation(
                      conversation,
                    )
                  } else if (conversation.id) {
                    // 更新AI provider的当前使用的会话
                    await currentChatSystem.currentAdapter?.createConversation(
                      conversation,
                    )
                  }
                  // 处理AIProvider的参数
                  await processAskAIParameters(conversation, question)
                  // 处理attachments
                  if (currentChatSystem.currentAdapter) {
                    if (
                      currentChatSystem.currentAdapter.chatFiles.length === 0 &&
                      question.meta?.regenerate &&
                      question.meta.attachments?.length
                    ) {
                      await currentChatSystem.currentAdapter.clearFiles()
                      await currentChatSystem.currentAdapter.updateFiles(
                        question.meta.attachments,
                      )
                    }
                  }
                  // 更新客户端的聊天记录
                  await currentChatSystem.updateClientConversationMessages(
                    conversation.id,
                  )
                }
              }
              await currentChatSystem.sendQuestion(taskId, sender, question)
              currentChatSystem.updateClientFiles()
            }
            break
          case 'Client_removeChatGPTConversation': {
            const { conversationId, isForceRemove = false } = data
            if (isForceRemove && conversationId) {
              const success = await ConversationManager.softDeleteConversation(
                conversationId,
              )
              return {
                success,
                data: {},
                message: '',
              }
            }
            console.log('新版Conversation 删除会话', conversationId)
            const success = await currentChatSystem.removeConversation(
              conversationId || '',
            )
            await currentChatSystem.updateClientConversationMessages(
              conversationId,
            )
            return {
              success,
              data: {},
              message: '',
            }
          }
          case 'Client_abortAskChatGPTQuestion': {
            const { messageId } = data
            await currentChatSystem.abortAskQuestion(messageId)
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          case 'Client_destroyWithLogout': {
            await currentChatSystem.destroy()
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          case 'Client_chatGetFiles':
            {
              return {
                success: true,
                data: currentChatSystem.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatUploadFiles':
            {
              const { files } = data
              await currentChatSystem.uploadFiles(files)
              currentChatSystem.updateClientFiles()
              return {
                success: true,
                data: currentChatSystem.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatAbortUploadFiles':
            {
              const { files } = data
              const success = await currentChatSystem.abortUploadFiles(
                files.map((file: IChatUploadFile) => file.id),
              )
              currentChatSystem.updateClientFiles()
              return {
                success,
                data: currentChatSystem.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatRemoveFiles':
            {
              const { files } = data
              const success = await currentChatSystem.removeFiles(
                files.map((file: IChatUploadFile) => file.id),
              )
              currentChatSystem.updateClientFiles()
              return {
                success,
                data: currentChatSystem.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatClearFiles':
            {
              const success = await currentChatSystem.clearFiles()
              currentChatSystem.updateClientFiles()
              return {
                success,
                data: currentChatSystem.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatUploadFilesChange':
            {
              const { files } = data
              await currentChatSystem.updateFiles(files)
              await currentChatSystem.updateClientFiles()
              return {
                success: true,
                data: {},
                message: 'ok',
              }
            }
            break
          case 'Client_chatGetUploadFileToken': {
            const token = await currentChatSystem.getUploadFileToken()
            return {
              success: true,
              data: token,
              message: 'ok',
            }
          }
          default:
            break
        }
      }
      return undefined
    })
  }
}
