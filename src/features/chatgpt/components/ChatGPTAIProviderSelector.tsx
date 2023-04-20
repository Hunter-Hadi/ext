import React, { FC } from 'react'
import {
  FormControl,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material'
import { CHAT_GPT_PROVIDER } from '@/types'
import { ChatGPTModelsSelector } from '@/features/chatgpt/components/ChatGPTModelsSelector'
import { IChatGPTProviderType } from '@/background/provider/chat'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import UseChatGPTAIQuotaLeft from '@/features/chatgpt/components/UseChatGPTAIQuotaLeft'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

const ArrowDropDownIconCustom = () => {
  return (
    <ArrowDropDownIcon
      sx={{
        color: 'text.secondary',
        fontSize: '16px',
        position: 'absolute',
        right: '8px',
        top: 'calc(50% - 8px)',
      }}
    />
  )
}

const ChatGPTAIProviderSelector: FC = () => {
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const clientState = useRecoilValue(ChatGPTClientState)
  const { updateChatGPTProvider, provider } = useChatGPTProvider()
  return (
    <Stack
      sx={{ height: 56, p: 1 }}
      spacing={2}
      direction={'row'}
      alignItems={'center'}
    >
      <FormControl size={'small'} sx={{ width: 224, height: 40 }}>
        <InputLabel sx={{ fontSize: '16px' }} id="chatGPT-ai-provider-select">
          AI Provider
        </InputLabel>
        <Select
          IconComponent={ArrowDropDownIconCustom}
          disabled={chatGPTConversationLoading}
          sx={{ fontSize: '14px' }}
          labelId="chatGPT-ai-provider-select"
          value={provider || ''}
          label="AI Provider"
          onChange={async (event) => {
            const { value } = event.target
            await updateChatGPTProvider(value as IChatGPTProviderType)
          }}
        >
          <MenuItem value={CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS}>
            <Typography
              fontSize={'14px'}
              color={'text.primary'}
              textAlign={'left'}
            >
              UseChatGPT.AI
            </Typography>
          </MenuItem>
          <MenuItem value={CHAT_GPT_PROVIDER.OPENAI}>
            <Typography
              fontSize={'14px'}
              color={'text.primary'}
              textAlign={'left'}
            >
              ChatGPT
            </Typography>
          </MenuItem>
        </Select>
      </FormControl>
      {provider === CHAT_GPT_PROVIDER.OPENAI &&
        clientState.status === 'success' && <ChatGPTModelsSelector />}
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS &&
        clientState.status === 'success' && <UseChatGPTAIQuotaLeft />}
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
