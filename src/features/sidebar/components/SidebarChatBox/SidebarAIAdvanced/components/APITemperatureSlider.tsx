import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import { getAIProviderSettings } from '@/background/src/chat/util'
import useThirdProviderSettings from '@/features/chatgpt/hooks/useThirdProviderSettings'

const APITemperatureSlider: FC<{
  provider: IAIProviderType
}> = (props) => {
  // 隐藏temperature的设置
  return null
  const { provider } = props
  const { t } = useTranslation(['common', 'client'])
  const { saveThirdProviderSettings, currentThirdProviderSettings } =
    useThirdProviderSettings()
  const [temperature, setTemperature] = React.useState<number>(1)
  const once = React.useRef<boolean>(false)
  useEffect(() => {
    if (once.current) {
      return
    }
    once.current = true
    setTemperature(currentThirdProviderSettings.temperature)
  }, [currentThirdProviderSettings.temperature])
  const debounceSaveThirdProviderSettings = debounce(async (value: number) => {
    const prevTemperature = ((await getAIProviderSettings(provider)) as any)
      ?.temperature
    if (prevTemperature !== value) {
      await saveThirdProviderSettings(provider, {
        temperature: value,
      })
    }
  }, 200)
  useEffect(() => {
    debounceSaveThirdProviderSettings(temperature)
  }, [temperature])
  return (
    <FormControl
      fullWidth
      sx={{
        '#max-ai__ai-provider-temperature-select-label': {
          fontSize: 16,
        },

        'fieldset > legend': {
          fontSize: 14,
        },
      }}
    >
      <InputLabel id="max-ai__ai-provider-temperature-select-label">
        {`${t('client:provider__temperature__label')}: ${
          currentThirdProviderSettings.temperature
        }`}
      </InputLabel>

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
        id="max-ai__ai-provider-temperature-select-label"
        value={temperature}
        label={`${t('client:provider__temperature__label')}: ${temperature}`}
        renderValue={(value) => {
          return (
            <Box
              sx={{
                '& > div': {
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                },
              }}
            >
              <Slider
                size={'small'}
                marks={[
                  {
                    value: 0,
                    label: t('client:provider__temperature__precise__title'),
                  },
                  {
                    value: 1,
                    label: t('client:provider__temperature__balanced__title'),
                  },
                  {
                    value: 2,
                    label: t('client:provider__temperature__creative__title'),
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
            </Box>
          )
        }}
      ></Select>
    </FormControl>
  )
}
export default APITemperatureSlider
