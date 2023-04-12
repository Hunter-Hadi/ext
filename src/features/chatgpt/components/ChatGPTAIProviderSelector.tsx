import React, { FC } from 'react'
import {
  FormControl,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Link,
} from '@mui/material'
import {
  APP_USE_CHAT_GPT_HOST,
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_DOC_URL,
} from '@/types'
import { ChatGPTModelsSelector } from '@/features/chatgpt/components/ChatGPTModelsSelector'
import { IChatGPTProviderType } from '@/background/provider/chat'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import { GiftIcon } from '@/components/CustomIcon'

const ChatGPTAIProviderSelector: FC = () => {
  const { updateChatGPTProvider, provider } = useChatGPTProvider()
  return (
    <Stack sx={{ height: 56, p: 1 }} spacing={2} direction={'row'}>
      <FormControl size={'small'} sx={{ width: 224, height: 40 }}>
        <InputLabel sx={{ fontSize: '16px' }} id="chatGPT-ai-provider-select">
          AI Provider
        </InputLabel>
        <Select
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
            UseChatGPT.AI Plus
          </MenuItem>
          <MenuItem value={CHAT_GPT_PROVIDER.OPENAI}>ChatGPT</MenuItem>
        </Select>
      </FormControl>
      {provider === CHAT_GPT_PROVIDER.OPENAI && <ChatGPTModelsSelector />}
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
        <Stack spacing={0.5}>
          <Typography fontSize={'12px'} color={'text.primary'}>
            Quota left: 12weeks
          </Typography>
          <Link
            href={APP_USE_CHAT_GPT_HOST + '/account/referral'}
            target={'_blank'}
            rel="noreferrer"
          >
            <Stack
              alignItems={'center'}
              spacing={'0.5'}
              direction={'row'}
              sx={{ cursor: 'pointer' }}
              height={'18px'}
            >
              <GiftIcon
                sx={{
                  position: 'relative',
                  top: 3,
                  fontSize: 24,
                  width: 24,
                  height: 24,
                  color: 'primary.main',
                }}
              />
              <Typography
                fontSize={'12px'}
                fontWeight={500}
                color={'primary.main'}
              >
                Get free quota!
              </Typography>
            </Stack>
          </Link>
        </Stack>
      )}
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
