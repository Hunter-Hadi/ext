import React, { FC } from 'react'

import { BaseSelect } from '@/components/select'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import { OPENAI_API_MODELS } from '@/constants'
import useChatGPTApiSettings from '@/features/chatgpt/hooks/useChatGPTApiSettings'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

const models = list2Options(OPENAI_API_MODELS)

const ChatGPTOpenAIAPIModelSelector: FC = () => {
  const { settings, loading, updateSettings, cleanChatGPT, loaded } =
    useChatGPTApiSettings()
  if (!loaded) {
    return null
  }
  return (
    <BaseSelect
      sx={{ width: 196 }}
      size={'small'}
      loading={loading}
      label={'Model'}
      labelSx={{
        fontSize: 16,
      }}
      options={models}
      value={settings.apiModel}
      onChange={async (value) => {
        await updateSettings('apiModel', value)
        await cleanChatGPT()
      }}
    />
  )
}

const ChatGPTOpenAIAPITemperatureSlider: FC = () => {
  const { settings, updateSettings, loaded, loading } = useChatGPTApiSettings()
  if (!loaded) {
    return null
  }
  return (
    <Stack mb={3} px={1}>
      <Typography fontSize={'14px'} color={'text.primary'}>
        {`Temperature (conversation style): `}
        {settings.temperature}
      </Typography>
      <Slider
        disabled={loading}
        size={'small'}
        marks={[
          {
            value: 0,
            label: 'Precise',
          },
          {
            value: 1,
            label: 'Balanced',
          },
          {
            value: 2,
            label: 'Creative',
          },
        ]}
        min={0}
        max={2}
        step={0.1}
        value={settings.temperature}
        onChange={async (e, value) => {
          await updateSettings('temperature', value)
        }}
        sx={{
          width: 'calc(100% - 60px)',
          mx: 'auto',
          '& .use-chat-gpt-ai--MuiSlider-markLabel': {
            color: 'text.primary',
            fontSize: '14px',
          },
        }}
      />
    </Stack>
  )
}

export { ChatGPTOpenAIAPIModelSelector, ChatGPTOpenAIAPITemperatureSlider }
