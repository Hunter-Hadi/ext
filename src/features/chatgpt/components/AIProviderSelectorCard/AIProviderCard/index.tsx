import React, { FC } from 'react'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import AIProviderInfoCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderInfoCard'
import AIProviderModelSelector from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderModelSelector'
import OpenAIAPITemperatureSlider from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/OpenAIAPITemperatureSlider'
import { ChatGPTPluginsSelector } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/ChatGPTPluginsSelector'
import BingConversationStyleSelector from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/BingConversationStyleSelector'

const AIProviderCard: FC<{
  aiProviderOption: AIProviderOptionType
}> = (props) => {
  const { aiProviderOption } = props
  return (
    <AIProviderInfoCard
      aiProviderOption={aiProviderOption}
      boxSx={{
        gap: '8px',
        '& > .use-chat-gpt-ai--MuiFormControl-root + .use-chat-gpt-ai--MuiFormControl-root':
          {
            mt: '8px',
          },
      }}
    >
      {aiProviderOption.value === 'OPENAI_API' && (
        <OpenAIAPITemperatureSlider />
      )}
      {aiProviderOption.value === 'OPENAI' && <ChatGPTPluginsSelector />}
      {aiProviderOption.value === 'BING' && <BingConversationStyleSelector />}
      <AIProviderModelSelector />
    </AIProviderInfoCard>
  )
}

export default AIProviderCard
