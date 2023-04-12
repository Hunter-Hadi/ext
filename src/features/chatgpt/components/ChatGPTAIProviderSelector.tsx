import React, { FC } from 'react'
import { FormControl, Stack, InputLabel, Select, MenuItem } from '@mui/material'
import { useRecoilState } from 'recoil'
import { CHAT_GPT_PROVIDER } from '@/types'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ChatGPTModelsSelector } from '@/features/chatgpt/components/ChatGPTModelsSelector'
import { IChatGPTProviderType } from '@/background/provider/chat'

const port = new ContentScriptConnectionV2()
const ChatGPTAIProviderSelector: FC = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  return (
    <Stack sx={{ height: 56, p: 1 }} spacing={2} direction={'row'}>
      <FormControl size={'small'} sx={{ width: 224, height: 40 }}>
        <InputLabel id="chatGPT-ai-provider-select">AI Provider</InputLabel>
        <Select
          labelId="chatGPT-ai-provider-select"
          value={appSettings.chatGPTProvider || ''}
          label="AI Provider"
          onChange={async (event) => {
            const { value } = event.target
            setAppSettings((prevState) => {
              return {
                ...prevState,
                chatGPTProvider: value as IChatGPTProviderType,
              }
            })
            await port.postMessage({
              event: 'Client_switchChatGPTProvider',
              data: {
                provider: value as IChatGPTProviderType,
              },
            })
            const result = await port.postMessage({
              event: 'Client_switchChatGPTProvider',
              data: {
                provider: value as IChatGPTProviderType,
              },
            })
            if (result.success) {
              await port.postMessage({
                event: 'Client_authChatGPTProvider',
                data: {},
              })
            }
          }}
        >
          <MenuItem value={CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS}>
            UseChatGPT.AI Plus
          </MenuItem>
          <MenuItem value={CHAT_GPT_PROVIDER.OPENAI}>ChatGPT</MenuItem>
        </Select>
      </FormControl>
      {appSettings.chatGPTProvider === CHAT_GPT_PROVIDER.OPENAI && (
        <ChatGPTModelsSelector />
      )}
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
