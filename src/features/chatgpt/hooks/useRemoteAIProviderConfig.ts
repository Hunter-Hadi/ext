import { useEffect, useState } from 'react'

import {
  DEFAULT_REMOTE_AI_PROVIDER_CONFIG,
  getRemoteAIProviderConfigCache,
  IRemoteAIProviderConfig,
} from '@/background/src/chat/OpenAIChat/utils'

/**
 * 获取在https://www.phtracker.com/crx/info/provider/v2的json配置
 */
const useRemoteAIProviderConfig = () => {
  const [remoteAIProviderConfig, setRemoteAIProviderConfig] =
    useState<IRemoteAIProviderConfig>(DEFAULT_REMOTE_AI_PROVIDER_CONFIG)
  useEffect(() => {
    getRemoteAIProviderConfigCache().then(setRemoteAIProviderConfig)
  }, [])
  return {
    remoteAIProviderConfig,
  }
}
export default useRemoteAIProviderConfig
