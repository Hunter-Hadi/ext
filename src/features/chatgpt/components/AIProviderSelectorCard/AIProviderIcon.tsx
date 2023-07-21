import React, { FC } from 'react'
import { IAIProviderType } from '@/background/provider/chat'
import {
  BardIcon,
  BingIcon,
  ChatGPTBlackIcon,
  ChatGPTIcon,
  ClaudeIcon,
  OpenAIIcon,
  PoeIcon,
} from '@/components/CustomIcon'
import { SxProps } from '@mui/material/styles'

export interface AIProviderIconProps {
  aiProviderType: IAIProviderType
  size?: number
  sx?: SxProps
}
const AIProviderIcon: FC<AIProviderIconProps> = (props) => {
  const { aiProviderType, size = 20, sx } = props
  return (
    <>
      {aiProviderType === 'USE_CHAT_GPT_PLUS' && (
        <ChatGPTIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'OPENAI_API' && (
        <OpenAIIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )}
      {aiProviderType === 'OPENAI' && (
        <ChatGPTBlackIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'BARD' && (
        <BardIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'BING' && (
        <BingIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'CLAUDE' && (
        <ClaudeIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
      {aiProviderType === 'POE' && (
        <PoeIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )}
    </>
  )
}
export default AIProviderIcon
