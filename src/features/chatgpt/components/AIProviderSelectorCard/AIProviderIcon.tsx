import React, { FC } from 'react'
import { IChatGPTProviderType } from '@/background/provider/chat'
import {
  BardIcon,
  BingIcon,
  ChatGPTBlackIcon,
  ChatGPTIcon,
  ClaudeIcon,
  OpenAIIcon,
  PoeIcon,
} from '@/components/CustomIcon'

export const AIProviderIcon: FC<{
  aiProviderType: IChatGPTProviderType
  size?: number
}> = (props) => {
  const { aiProviderType, size = 20 } = props
  return (
    <>
      {aiProviderType === 'USE_CHAT_GPT_PLUS' && (
        <ChatGPTIcon sx={{ fontSize: size }} />
      )}
      {aiProviderType === 'OPENAI_API' && (
        <OpenAIIcon
          sx={{
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )}
      {aiProviderType === 'OPENAI' && (
        <ChatGPTBlackIcon
          sx={{
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'BARD' && (
        <BardIcon
          sx={{
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'BING' && (
        <BingIcon
          sx={{
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'CLAUDE' && (
        <ClaudeIcon
          sx={{
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'POE' && (
        <PoeIcon
          sx={{
            fontSize: size,
          }}
        />
      )}
    </>
  )
}
export default AIProviderIcon
