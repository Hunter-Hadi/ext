import React, { FC } from 'react'

import { BaseSelect } from '@/components/select'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import { OPENAI_API_MODELS } from '@/constants'
import useChatGPTApiSettings from '@/features/chatgpt/hooks/useChatGPTApiSettings'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import dayjs from 'dayjs'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'

const models = list2Options(OPENAI_API_MODELS)

const ChatGPTOpenAIAPIModelSelector: FC = () => {
  const { settings, loading, updateSettings, cleanChatGPT, loaded } =
    useChatGPTApiSettings()
  if (!loaded) {
    return null
  }
  return (
    <BaseSelect
      MenuProps={{
        elevation: 0,
        MenuListProps: {
          sx: {
            border: `1px solid`,
            borderColor: 'customColor.borderColor',
          },
        },
      }}
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
      labelProp={{
        p: 0,
        pointerEvents: 'auto!important',
      }}
      renderValue={(value) => {
        const option = models.find((item) => item.value === value)
        return (
          <Stack
            sx={{ padding: '6px 0' }}
            width={160}
            direction={'row'}
            alignItems={'center'}
            spacing={1}
          >
            <Typography
              component={'span'}
              fontSize={14}
              color={'text.primary'}
              textAlign={'left'}
              noWrap
            >
              {option.label || 'Select model'}
            </Typography>
          </Stack>
        )
      }}
      renderLabel={(value, option) => {
        // description
        // label
        // maxTokens
        // trainingDate
        // value
        const original = option.origin
        return (
          <Tooltip
            placement={'left-start'}
            componentsProps={{
              tooltip: {
                sx: {
                  border: '1px solid rgb(245,245,245)',
                  bgcolor: 'background.paper',
                  p: 1,
                },
              },
            }}
            title={
              <Stack spacing={1} width={'160px'}>
                <Stack textAlign={'left'} width={'100%'} spacing={2}>
                  <Alert
                    sx={{
                      px: 1,
                      py: 0,
                      '& > :first-child': {
                        display: 'none',
                      },
                    }}
                    severity={'info'}
                    icon={<></>}
                  >
                    <Typography
                      fontSize={'12px'}
                      color={'text.primary'}
                      textAlign={'left'}
                    >
                      <span>{`Protip: `}</span>
                      <b>{`"Model"`}</b>
                      <span>{` selector on `}</span>
                      <Link
                        target={'_blank'}
                        href="https://platform.openai.com/playground?mode=chat"
                        rel="noreferrer"
                      >
                        {`OpenAI Playground`}
                      </Link>
                      <span>{` shows your active models.`}</span>
                    </Typography>
                  </Alert>
                  <Typography
                    fontSize={'14px'}
                    color={'text.primary'}
                    textAlign={'left'}
                    fontWeight={'bold'}
                  >
                    {original?.label}
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography
                    fontSize={'12px'}
                    color={'text.secondary'}
                    textAlign={'left'}
                  >
                    Max tokens:
                  </Typography>
                  <Typography
                    fontSize={'12px'}
                    color={'text.primary'}
                    textAlign={'left'}
                  >
                    {numberWithCommas(original?.maxTokens || 0, 0)} tokens
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography
                    fontSize={'12px'}
                    color={'text.secondary'}
                    textAlign={'left'}
                  >
                    Description:
                  </Typography>
                  <Typography
                    fontSize={'12px'}
                    color={'text.primary'}
                    textAlign={'left'}
                  >
                    {original?.description}
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography
                    fontSize={'12px'}
                    color={'text.secondary'}
                    textAlign={'left'}
                  >
                    Training date:
                  </Typography>
                  <Typography
                    fontSize={'12px'}
                    color={'text.primary'}
                    textAlign={'left'}
                  >
                    {`Up to ${dayjs(original?.trainingDate).format(
                      'MMM YYYY',
                    )}`}
                  </Typography>
                </Stack>
              </Stack>
            }
          >
            <Stack
              sx={{ padding: '6px 16px' }}
              width={160}
              direction={'row'}
              alignItems={'center'}
              spacing={1}
            >
              <Typography
                component={'span'}
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
                noWrap
              >
                {original.label || 'Select model'}
              </Typography>
            </Stack>
          </Tooltip>
        )
      }}
    />
  )
}

const ChatGPTOpenAIAPITemperatureSlider: FC = () => {
  const { settings, updateSettings, loaded } = useChatGPTApiSettings()
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
