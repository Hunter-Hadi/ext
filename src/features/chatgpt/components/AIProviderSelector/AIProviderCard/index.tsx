import React, { FC } from 'react'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelector/AIProviderOptions'
import AIProviderInfoCard from '@/features/chatgpt/components/AIProviderSelector/AIProviderInfoCard'
import AIProviderModelSelector from '@/features/chatgpt/components/AIProviderSelector/AIProviderModelSelector'
import OpenAIAPITemperatureSlider from '@/features/chatgpt/components/AIProviderSelector/AIProviderCard/components/OpenAIAPITemperatureSlider'

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
