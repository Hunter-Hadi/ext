import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import useThirdProviderSetting from '@/features/chatgpt/hooks/useThirdProviderSetting'

const ChatGPTOpenAIAPITemperatureSlider: FC = () => {
  const { saveThirdProviderSettings, currentThirdProviderSettings } =
    useThirdProviderSetting()
  return (
    <Stack mb={3} px={1}>
      <Typography fontSize={'14px'} color={'text.primary'}>
        {`Temperature (conversation style): `}
        {currentThirdProviderSettings.temperature}
      </Typography>
      <Slider
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
        value={currentThirdProviderSettings.temperature}
        onChange={async (e, value) => {
          await saveThirdProviderSettings('OPENAI_API', {
            temperature: value as number,
          })
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
export default ChatGPTOpenAIAPITemperatureSlider
