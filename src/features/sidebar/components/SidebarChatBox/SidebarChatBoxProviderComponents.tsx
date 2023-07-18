import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import Stack from '@mui/material/Stack'
import { CHAT_GPT_PROVIDER } from '@/constants'
import DevTextSendControl from '@/features/sidebar/components/SidebarChatBox/DevTextSendControl'
import { ChatGPTPluginsSelector } from '@/features/chatgpt/components/ChatGPTPluginsSelector'
import React from 'react'
import { ChatGPTOpenAIAPITemperatureSlider } from '@/features/chatgpt/components/ChatGPTOpenAIAPIComponents'

const SidebarChatBoxProviderComponents = () => {
  const { provider } = useChatGPTProvider()
  return (
    <Stack
      width={'100%'}
      sx={{
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
      }}
    >
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
        <DevTextSendControl />
      )}
      {provider === CHAT_GPT_PROVIDER.OPENAI && <ChatGPTPluginsSelector />}
      {provider === CHAT_GPT_PROVIDER.OPENAI_API && (
        <ChatGPTOpenAIAPITemperatureSlider />
      )}
    </Stack>
  )
}
export default SidebarChatBoxProviderComponents
