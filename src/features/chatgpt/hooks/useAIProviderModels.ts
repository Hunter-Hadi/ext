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
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { getChatGPTWhiteListModelAsync } from '@/background/src/chat/OpenAiChat/utils'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useThirdProviderSettings from '@/features/chatgpt/hooks/useThirdProviderSettings'
import { IAIProviderModel } from '@/features/chatgpt/types'
import { AppLocalStorageState } from '@/store'

/**
 * 用来获取当前AI提供商的模型列表
 * @since 2023-07-18
 * @version 1.0.0 - 返回数据结构title\titleTag\maxToken\tags\descriptions
 */

const useAIProviderModels = () => {
  const [appLocalStorage] = useRecoilState(AppLocalStorageState)
  const currentProvider =
    appLocalStorage.sidebarSettings?.common?.currentAIProvider
  const { currentThirdProviderSettings } = useThirdProviderSettings()
  const { createConversation } = useClientConversation()
  // ===chatgpt 特殊处理开始===
  const [whiteListModels, setWhiteListModels] = useState<string[]>([])
  useEffect(() => {
    if (currentProvider === 'OPENAI') {
      getChatGPTWhiteListModelAsync().then((data) => {
        setWhiteListModels(data)
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
              const key = `provider__chatgpt_web_app__${item.slug}__description`.replace(
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
    }
  }, [
    whiteListModels,
    appLocalStorage.thirdProviderSettings?.OPENAI?.modelOptions,
  ])
  const aiProviderModels = useMemo<IAIProviderModel[]>(() => {
    let currentModels: IAIProviderModel[] = []
    if (!currentProvider) {
      return currentModels
    }
    currentModels = AI_PROVIDER_MODEL_MAP[currentProvider]
    return currentModels
  }, [currentProvider, AI_PROVIDER_MODEL_MAP])
  const currentAIProviderModel = useMemo(() => {
    return currentThirdProviderSettings?.model || ''
  }, [currentProvider, currentThirdProviderSettings])
  const currentAIProviderDetail = useMemo(() => {
    return AIProviderOptions.find((item) => item.value === currentProvider)
  }, [currentProvider])
  const currentAIProviderModelDetail = useMemo(() => {
    return aiProviderModels.find(
      (item) => item.value === currentAIProviderModel,
    )
  }, [currentAIProviderModel, aiProviderModels])
  const updateAIProviderModel = useCallback(
    async (AIProvider: IAIProviderType, model: string) => {
      try {
        let now = new Date().getTime()
        await setChromeExtensionLocalStorage({
          sidebarSettings: {
            common: {
              currentAIProvider: AIProvider,
            },
            chat: {
              conversationId: '',
            },
            art: {
              conversationId: '',
            },
          },
          thirdProviderSettings: {
            [AIProvider]: {
              model,
            },
          },
        })

        console.log(
          '[TimeTimeTimeTime] 切换AIProvider1',
          new Date().getTime() - now,
        )
        now = new Date().getTime()
        if (AIProvider === 'MAXAI_DALLE') {
          await createConversation('Art')
        } else {
          await createConversation('Chat')
        }
        console.log(
          '[TimeTimeTimeTime] 切换AIProvider2',
          new Date().getTime() - now,
        )
      } catch (e) {
        console.log(e)
      }
    },
    [currentProvider, aiProviderModels],
  )
  return {
    currentAIProviderModel: currentAIProviderModel,
    currentAIProvider:
      appLocalStorage.sidebarSettings?.common?.currentAIProvider,
    currentAIProviderDetail,
    currentAIProviderModelDetail,
    aiProviderModels,
    updateAIProviderModel,
    AI_PROVIDER_MODEL_MAP,
  }
}

export default useAIProviderModels
