import React, { FC } from 'react'
import { FormControl, Stack, InputLabel, Select, MenuItem } from '@mui/material'
import {
  ChatGPTClientState,
  IChatGPTProviderType,
} from '@/features/chatgpt/store'
import { useRecoilState } from 'recoil'
import { CHAT_GPT_PROVIDER } from '@/types'

const ChatGPTAIProviderSelector: FC = () => {
  const [chatGPTClient, setChatGPTClient] = useRecoilState(ChatGPTClientState)
  return (
    <Stack sx={{ height: 56, p: 1 }} spacing={2} direction={'row'}>
      <FormControl size={'small'} sx={{ width: 224 }}>
        <InputLabel id="chatGPT-ai-provider-select">AI Provider</InputLabel>
        <Select
          labelId="chatGPT-ai-provider-select"
          id="demo-simple-select"
          value={chatGPTClient.provider}
          label="AI Provider"
          onChange={(event) => {
            setChatGPTClient((prevState) => {
              return {
                ...prevState,
                provider: event.target.value as IChatGPTProviderType,
              }
            })
          }}
        >
          <MenuItem value={CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS}>
            UseChatGPT.AI Plus
          </MenuItem>
          <MenuItem value={CHAT_GPT_PROVIDER.OPENAI}>ChatGPT</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
