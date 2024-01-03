import { useEffect, useMemo, useState } from 'react'

import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { getInputMediator, InputMediatorName } from '@/store/InputMediator'

const useChatInputMaxTokens = (inputName: InputMediatorName) => {
  const [inputValue, setInputValue] = useState('')
  const { currentAIProviderModelDetail } = useAIProviderModels()
  const currentMaxInputLength = useMemo(() => {
    // NOTE: GPT-4 最大输入长度为 80000，GPT-3 最大输入长度为 10000, 我们后端最多6000，所以这里写死4000
    const maxTokens = currentAIProviderModelDetail?.maxTokens || 4000
    // 取整到千分位
    return Math.floor(maxTokens / 1000) * 1000
    // return conversation.model === 'gpt-4'
    //   ? MAX_GPT4_INPUT_LENGTH
    //   : MAX_NORMAL_INPUT_LENGTH
  }, [currentAIProviderModelDetail])
  const isError = useMemo(() => {
    return inputValue.length > currentMaxInputLength
  }, [inputValue, currentMaxInputLength])
  useEffect(() => {
    const handleInputUpdate = (newInputValue: string) => {
      if (newInputValue.startsWith('``NO_HISTORY_&#``\n')) {
        newInputValue = newInputValue.replace('``NO_HISTORY_&#``\n', '')
      }
      setInputValue(newInputValue)
    }
    getInputMediator(inputName).subscribe(handleInputUpdate)
    return () => {
      getInputMediator(inputName).unsubscribe(handleInputUpdate)
    }
  }, [])
  return {
    currentMaxInputLength,
    isError,
  }
}
export default useChatInputMaxTokens
