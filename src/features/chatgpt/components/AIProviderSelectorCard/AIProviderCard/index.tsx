import React, { FC } from 'react'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import AIProviderInfoCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderInfoCard'
import AIProviderModelSelector from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderModelSelector'
import OpenAIAPITemperatureSlider from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/OpenAIAPITemperatureSlider'

const AIProviderCard: FC<{
  aiProviderOption: AIProviderOptionType
}> = (props) => {
  const { aiProviderOption } = props
  return (
    <AIProviderInfoCard
      aiProviderOption={aiProviderOption}
      boxSx={{
        p: 0,
      }}
    >
      {aiProviderOption.value === 'OPENAI_API' && (
        <OpenAIAPITemperatureSlider />
      )}
      <AIProviderModelSelector />
    </AIProviderInfoCard>
  )
}

export default AIProviderCard
