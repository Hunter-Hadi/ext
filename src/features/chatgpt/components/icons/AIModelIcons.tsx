import { SvgIcon } from '@mui/material'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import {
  MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
} from '@/background/src/chat/UseChatGPTChat/types'
import {
  ChatGPT4Icon,
  ChatGPTIcon,
  ClaudeIcon,
  DALLEIcon,
  GeminiIcon,
  MaxAIFreeIcon,
} from '@/components/CustomIcon'
import ThirdPartyAIProviderIcon from '@/features/chatgpt/components/icons/ThirdPartyAIProviderIcon'
import { isThirdPartyAIProvider } from '@/features/chatgpt'
import { IAIProviderType } from '@/background/provider/chat'

export interface AIProviderIconProps {
  aiProvider?: IAIProviderType
  aiModelValue: string
  size?: number
  sx?: SxProps
}
const AIProviderIcon: FC<AIProviderIconProps> = (props) => {
  const { aiProvider, aiModelValue, size = 20, sx } = props

  if (aiProvider && isThirdPartyAIProvider(aiProvider)) {
    return (
      <ThirdPartyAIProviderIcon
        sx={{
          ...sx,
          fontSize: size,
        }}
      />
    )
  }

  switch (aiModelValue) {
    case MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO:
      return (
        <ChatGPTIcon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )
    case MAXAI_CHATGPT_MODEL_GPT_4_TURBO:
      return (
        <ChatGPT4Icon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )
    case 'gpt-4':
      return (
        <ChatGPT4Icon
          sx={{
            ...sx,
            fontSize: size,
          }}
        />
      )
    case 'claude-3-opus':
      return (
        <SvgIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 8C0 3.58172 3.58172 0 8 0H16C20.4183 0 24 3.58172 24 8V16C24 20.4183 20.4183 24 16 24H8C3.58172 24 0 20.4183 0 16V8Z"
              fill="#F2DFBC"
            />
            <path
              d="M15.6487 6H13.0444L17.7937 18H20.3981L15.6487 6ZM8.12437 6L3.375 18H6.03075L7.002 15.48H11.9707L12.942 18H15.5977L10.8484 6H8.12437ZM7.86112 13.2514L9.48637 9.03412L11.1116 13.2514H7.86112Z"
              fill="#1F1F1F"
            />
          </svg>
        </SvgIcon>
      )
    case 'claude-3-sonnet':
      return (
        <ClaudeIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )
    case 'claude-3-haiku':
      return (
        <SvgIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 8C0 3.58172 3.58172 0 8 0H16C20.4183 0 24 3.58172 24 8V16C24 20.4183 20.4183 24 16 24H8C3.58172 24 0 20.4183 0 16V8Z"
              fill="#F2DFBC"
            />
            <path
              d="M15.6487 6H13.0444L17.7937 18H20.3981L15.6487 6ZM8.12437 6L3.375 18H6.03075L7.002 15.48H11.9707L12.942 18H15.5977L10.8484 6H8.12437ZM7.86112 13.2514L9.48637 9.03412L11.1116 13.2514H7.86112Z"
              fill="#C46E52"
            />
          </svg>
        </SvgIcon>
      )
    case 'gemini-1.5-pro':
      return (
        <GeminiIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )
    case 'gemini-pro':
      return (
        <SvgIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 8C0 3.58172 3.58172 0 8 0H16C20.4183 0 24 3.58172 24 8V16C24 20.4183 20.4183 24 16 24H8C3.58172 24 0 20.4183 0 16V8Z"
              fill="#F0F4F8"
            />
            <path
              d="M12.0002 1.91211C12.0002 7.48113 7.48786 11.9963 1.91992 12.0009C7.48786 12.0055 12.0002 16.5206 12.0002 22.0896C12.0002 16.5206 16.5125 12.0055 22.0804 12.0009C16.5125 11.9963 12.0002 7.48113 12.0002 1.91211Z"
              fill="white"
            />
            <path
              d="M12.0002 1.91211C12.0002 7.48113 7.48786 11.9963 1.91992 12.0009C7.48786 12.0055 12.0002 16.5206 12.0002 22.0896C12.0002 16.5206 16.5125 12.0055 22.0804 12.0009C16.5125 11.9963 12.0002 7.48113 12.0002 1.91211Z"
              fill="url(#paint0_linear_10089_20064)"
              fillOpacity="0.7"
            />
            <path
              d="M12.0002 1.91211C12.0002 7.48113 7.48786 11.9963 1.91992 12.0009C7.48786 12.0055 12.0002 16.5206 12.0002 22.0896C12.0002 16.5206 16.5125 12.0055 22.0804 12.0009C16.5125 11.9963 12.0002 7.48113 12.0002 1.91211Z"
              fill="url(#paint1_linear_10089_20064)"
              fillOpacity="0.7"
            />
            <path
              d="M12.0002 1.91211C12.0002 7.48113 7.48786 11.9963 1.91992 12.0009C7.48786 12.0055 12.0002 16.5206 12.0002 22.0896C12.0002 16.5206 16.5125 12.0055 22.0804 12.0009C16.5125 11.9963 12.0002 7.48113 12.0002 1.91211Z"
              fill="url(#paint2_linear_10089_20064)"
              fillOpacity="0.2"
            />
            <defs>
              <linearGradient
                id="paint0_linear_10089_20064"
                x1="22.0804"
                y1="12.0009"
                x2="2.45594"
                y2="12.0009"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.218303" stopColor="#EAEAEA" />
                <stop offset="0.739459" stopColor="#126EEF" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_10089_20064"
                x1="12.0002"
                y1="1.91211"
                x2="12.0002"
                y2="22.0896"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.3125" stopColor="#D8D4D3" />
                <stop offset="0.656495" stopColor="#1170FB" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_10089_20064"
                x1="15.0598"
                y1="9.16777"
                x2="12.456"
                y2="12.2594"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#E7D6CA" />
                <stop offset="1" stopColor="#8DB9EA" />
              </linearGradient>
            </defs>
          </svg>
        </SvgIcon>
      )
    case 'dall-e-3':
      return (
        <DALLEIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )
    case 'mistral-7b-instruct':
    case 'openchat-7b':
    case 'mythomist-7b':
      return (
        <MaxAIFreeIcon
          sx={{
            ...sx,
            fontSize: size,
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
          }}
        />
      )
  }

  return null
}
export default AIProviderIcon
