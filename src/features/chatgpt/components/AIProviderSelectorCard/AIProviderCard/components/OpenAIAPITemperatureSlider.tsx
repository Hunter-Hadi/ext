import React, { FC, useEffect } from 'react'
import Slider from '@mui/material/Slider'
import useThirdProviderSetting from '@/features/chatgpt/hooks/useThirdProviderSetting'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import debounce from 'lodash-es/debounce'

const ChatGPTOpenAIAPITemperatureSlider: FC = () => {
  const { saveThirdProviderSettings, currentThirdProviderSettings } =
    useThirdProviderSetting()
  const [temperature, setTemperature] = React.useState<number>(1)
  const once = React.useRef<boolean>(false)
  useEffect(() => {
    if (!currentThirdProviderSettings.temperature) {
      return
    }
    if (once.current) {
      return
    }
    once.current = true
    setTemperature(currentThirdProviderSettings.temperature)
  }, [currentThirdProviderSettings.temperature])
  const debounceSaveThirdProviderSettings = debounce(async (value: number) => {
    await saveThirdProviderSettings('OPENAI_API', {
      temperature: value,
    })
  }, 200)
  useEffect(() => {
    debounceSaveThirdProviderSettings(temperature)
  }, [temperature])
  return (
    <FormControl fullWidth>
      <InputLabel id="openai-api-temperature-select-label">{`Temperature (conversation style): ${currentThirdProviderSettings.temperature}`}</InputLabel>
      <Select
        sx={{
          '& > div': {
            p: '8px !important',
          },
          '& > svg': {
            display: 'none',
          },
        }}
        open={false}
        id="openai-api-temperature-select-label"
        value={temperature}
        label={`Temperature (conversation style): ${temperature}`}
        renderValue={(value) => {
          return (
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
              value={temperature}
              onChange={async (e, value) => {
                setTemperature(value as number)
              }}
              sx={{
                width: '100%',
                mx: 'auto',
                mb: 0,
                '& .use-chat-gpt-ai--MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '12px',
                  fontWeight: '400',
                },
                '& > span[aria-hidden]': {
                  top: '20px',
                },
                '& > span[aria-hidden][data-index="0"]': {
                  left: '21px!important',
                },
                '& > span[aria-hidden][data-index="2"]': {
                  left: 'calc(100% - 22px) !important',
                },
              }}
            />
          )
        }}
      ></Select>
    </FormControl>
  )
}
export default ChatGPTOpenAIAPITemperatureSlider
