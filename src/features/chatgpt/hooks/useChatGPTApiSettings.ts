import { useState } from 'react'
import { IOpenAIApiSettingsType } from '@/background/src/chat/OpenAIApiChat/types'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'
import useEffectOnce from '@/hooks/useEffectOnce'
import {
  getOpenAIApiSettings,
  setOpenAIApiSettings,
} from '@/background/src/chat/OpenAIApiChat/utils'

const useChatGPTApiSettings = () => {
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const { cleanChatGPT } = useCleanChatGPT()
  const updateSettings = async (
    key: keyof IOpenAIApiSettingsType,
    value: any,
  ) => {
    try {
      setLoading(true)
      const newSettings = {
        ...(await getOpenAIApiSettings()),
        [key]: value,
      }
      setSettings(newSettings)
      await setOpenAIApiSettings(newSettings)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  useEffectOnce(() => {
    getOpenAIApiSettings().then((settings) => {
      setSettings(settings)
      setLoaded(true)
    })
  })
  return {
    settings,
    loading: loading || !loaded,
    setSettings,
    cleanChatGPT,
    setLoading,
    loaded,
    updateSettings,
  }
}

export default useChatGPTApiSettings
