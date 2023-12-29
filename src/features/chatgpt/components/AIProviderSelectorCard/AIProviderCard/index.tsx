import React, { FC } from 'react'

import APITemperatureSlider from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/APITemperatureSlider'
import BingConversationStyleSelector from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/BingConversationStyleSelector'
import { ChatGPTPluginsSelector } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard/components/ChatGPTPluginsSelector'
import AIProviderInfoCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderInfoCard'
import AIProviderModelSelector from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderModelSelector'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'

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
        <APITemperatureSlider provider={'OPENAI_API'} />
      )}
      {aiProviderOption.value === 'USE_CHAT_GPT_PLUS' && (
        <APITemperatureSlider
          provider={'USE_CHAT_GPT_PLUS'}
          authSceneType={'MAXAI_CHATGPT_TEMPERATURE'}
        />
      )}
      {aiProviderOption.value === 'OPENAI' && <ChatGPTPluginsSelector />}
      {aiProviderOption.value === 'BING' && <BingConversationStyleSelector />}
      <AIProviderModelSelector />
    </AIProviderInfoCard>
  )
}

export default AIProviderCard
