import cloneDeep from 'lodash-es/cloneDeep'
import reverse from 'lodash-es/reverse'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { MAXAI_FREE_MODELS } from '@/background/src/chat/MaxAIFreeChat/types'
import { MAXAI_GENMINI_MODELS } from '@/background/src/chat/MaxAIGeminiChat/types'
import { MAXAI_LLAMA_MODELS } from '@/background/src/chat/MaxAILlamaChat/types'
import { MAXAI_MISTRAL_MODELS } from '@/background/src/chat/MaxAIMistralChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { getRemoteAIProviderConfigCache } from '@/background/src/chat/OpenAIChat/utils'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
import { AppLocalStorageState } from '@/store'

export const useAIProviderModelsMap = () => {
  const [appLocalStorage] = useRecoilState(AppLocalStorageState)
  const currentProvider =
    appLocalStorage.sidebarSettings?.common?.currentAIProvider
  // ===chatgpt 特殊处理开始===
  const [whiteListModels, setWhiteListModels] = useState<string[]>([])
  useEffect(() => {
    if (currentProvider === 'OPENAI') {
      getRemoteAIProviderConfigCache().then((config) => {
        setWhiteListModels(config.chatGPTWebappModelsWhiteList)
      })
    }
  }, [currentProvider])
  // ===chatgpt 特殊处理结束===
  const AI_PROVIDER_MODEL_MAP = useMemo(() => {
    return {
      OPENAI: (
        appLocalStorage.thirdProviderSettings?.OPENAI?.modelOptions || []
      )
        .filter((item) => !item.tags?.includes('hidden'))
        .map((item) => {
          let uploadFileConfig: IAIProviderModel['uploadFileConfig'] = undefined
          if (item.slug === 'gpt-4-code-interpreter') {
            uploadFileConfig = {
              accept: '',
              acceptTooltip: (t: any) =>
                t('client:provider__chatgpt_web_app__upload__accept_tooltip'),
              maxFileSize: -1,
              maxCount: 1,
            }
          } else if (item.slug === 'gpt-4') {
            uploadFileConfig = {
              accept:
                'image/webp,.webp,image/png,.png,image/gif,.gif,image/jpeg,.jpg,.jpeg',
              acceptTooltip: (t) =>
                t('client:provider__chatgpt_web_app__upload__accept_tooltip'),
              maxFileSize: -1,
              maxCount: 1,
            }
          }
          const providerModel: IAIProviderModel = {
            title: item.title,
            value: item.slug,
            titleTag:
              item.tags?.find((tag) => tag.toLowerCase().includes('beta')) ||
              item.tags?.find((tag) => tag.toLowerCase().includes('mobile')) ||
              '',
            maxTokens: item.max_tokens,
            poweredBy: 'OpenAI',
            tags: item.tags || [],
            description: (t) => {
              const description = item.description
              const key =
                `provider__chatgpt_web_app__${item.slug}__description`.replace(
                  /-/g,
                  '_',
                )
              const i18nKey: any = `client:${key}`
              if (t(i18nKey) !== key) {
                return t(i18nKey)
              }
              return description
            },
            disabled:
              // 白名单有值才判断
              whiteListModels.length > 0
                ? !whiteListModels.includes(item.slug)
                : false,
            uploadFileConfig,
          }
          return providerModel
        })
        .reverse(),
      USE_CHAT_GPT_PLUS: reverse(cloneDeep(USE_CHAT_GPT_PLUS_MODELS)),
      BARD: BARD_MODELS,
      BING: BING_MODELS,
      OPENAI_API: reverse(cloneDeep(OPENAI_API_MODELS)),
      CLAUDE: CLAUDE_MODELS,
      POE: POE_MODELS,
      MAXAI_CLAUDE: reverse(cloneDeep(MAXAI_CLAUDE_MODELS)),
      MAXAI_GEMINI: reverse(cloneDeep(MAXAI_GENMINI_MODELS)),
      MAXAI_DALLE: reverse(cloneDeep(MAXAI_IMAGE_GENERATE_MODELS)),
      MAXAI_FREE: reverse(cloneDeep(MAXAI_FREE_MODELS)),
      MAXAI_LLAMA: reverse(cloneDeep(MAXAI_LLAMA_MODELS)),
      MAXAI_MISTRAL: reverse(cloneDeep(MAXAI_MISTRAL_MODELS)),
    }
  }, [
    whiteListModels,
    appLocalStorage.thirdProviderSettings?.OPENAI?.modelOptions,
  ])
  const getAIProviderModelDetail = (
    AIProvider: IAIProviderType,
    findModel: string,
  ) => {
    return AI_PROVIDER_MODEL_MAP[AIProvider]?.find(
      (model) => model.value === findModel,
    )
  }
  return {
    AI_PROVIDER_MODEL_MAP,
    getAIProviderModelDetail,
  }
}

/**
 * 用来获取当前AI提供商的模型列表
 * @since 2023-07-18
 * @version 1.0.0 - 返回数据结构title\titleTag\maxToken\tags\descriptions
 * @version 2.0.0 - 和AppLocalStorage解绑 - 2024-03-11
 */

const useAIProviderModels = () => {
  const { clientConversation } = useClientConversation()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const currentAIProvider = clientConversation?.meta?.AIProvider
  const currentAIProviderModel = clientConversation?.meta?.AIModel
  // 当前选中的AI provider的models
  const currentAIProviderModelOptions = useMemo<IAIProviderModel[]>(() => {
    let currentModels: IAIProviderModel[] = []
    if (!currentAIProvider) {
      return currentModels
    }
    currentModels = AI_PROVIDER_MODEL_MAP[currentAIProvider]
    return currentModels
  }, [currentAIProvider, AI_PROVIDER_MODEL_MAP])
  // 当前选中的AI provider的详情
  const currentAIProviderDetail = useMemo(() => {
    return AIProviderOptions.find((item) => item.value === currentAIProvider)
  }, [currentAIProvider])
  const currentAIProviderModelDetail = useMemo(() => {
    return currentAIProviderModelOptions.find(
      (item) => item.value === currentAIProviderModel,
    )
  }, [currentAIProviderModel, currentAIProviderModelOptions])
  /**
   * 更新AI provider的模型
   * @deprecated 2024-03-11 - 和AppLocalStorage解绑
   */
  const updateAIProviderModel = useCallback(
    async (
      AIProvider: IAIProviderType,
      model: string,
      // sidebarConversationType?: ISidebarConversationType,
    ) => {
      // try {
      // let now = new Date().getTime()
      // await setChromeExtensionLocalStorage({
      //   sidebarSettings: {
      //     common: {
      //       currentAIProvider: AIProvider,
      //     },
      //   },
      //   thirdProviderSettings: {
      //     [AIProvider]: {
      //       model,
      //     },
      //   },
      // })
      // console.log('updateAIProviderModel1', new Date().getTime() - now)
      // now = new Date().getTime()
      // await switchBackgroundChatSystemAIProvider(AIProvider)
      // console.log('updateAIProviderModel2', new Date().getTime() - now)
      // } catch (e) {
      //   console.log(e)
      // }
    },
    [currentAIProvider, currentAIProviderModelOptions],
  )
  return {
    currentAIProvider,
    currentAIProviderModel,
    currentAIProviderDetail,
    currentAIProviderModelDetail,
    currentAIProviderModelOptions,
    updateAIProviderModel,
  }
}

export default useAIProviderModels
