import React, { FC, useEffect, useMemo } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import uniqBy from 'lodash-es/uniqBy'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AppSettingsState } from '@/store'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { setChromeExtensionSettings } from '@/background/utils'
import { ChatGPTConversationState } from '@/features/gmail/store'

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

const WHITE_LIST_MODELS = [
  'gpt-4-mobile',
  'text-davinci-002-render-sha-mobile',
  'text-davinci-002-render-sha',
]

const ChatGPTOpenAIModelSelector: FC = () => {
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const { resetConversation } = useMessageWithChatGPT('')
  const memoModels = useMemo(() => {
    if (appSettings.models && appSettings.models.length > 0) {
      return uniqBy(appSettings.models, 'slug')
    }
    return []
  }, [appSettings.models])
  const updateNewModel = async (model: string) => {
    setAppSettings((prevState) => {
      return {
        ...prevState,
        currentModel: model,
      }
    })
    await setChromeExtensionSettings({
      currentModel: model,
    })
    await resetConversation()
  }
  useEffect(() => {
    if (appSettings.currentModel) {
      if (!WHITE_LIST_MODELS.includes(appSettings.currentModel)) {
        updateNewModel('text-davinci-002-render-sha')
      }
    }
  }, [appSettings.currentModel])
  return (
    <>
      {memoModels.length > 1 ? (
        <FormControl size="small" sx={{ height: 40 }}>
          <InputLabel
            sx={{ fontSize: '16px' }}
            id={'ChatGPTModelsSelectorLabel'}
          >
            <span style={{ fontSize: '16px' }}>Model</span>
          </InputLabel>
          <Select
            disabled={chatGPTConversationLoading}
            MenuProps={{
              elevation: 0,
              MenuListProps: {
                sx: {
                  border: `1px solid`,
                  borderColor: 'customColor.borderColor',
                },
              },
            }}
            sx={{ fontSize: '14px' }}
            IconComponent={ArrowDropDownIconCustom}
            labelId={'ChatGPTModelsSelectorLabel'}
            label={'Model'}
            value={appSettings.currentModel}
            onChange={async (event) => {
              setAppSettings((prevState) => {
                return {
                  ...prevState,
                  currentModel: event.target.value as string,
                }
              })
              await setChromeExtensionSettings({
                currentModel: event.target.value as string,
              })
              await resetConversation()
            }}
            renderValue={(value) => {
              const findModal = memoModels.find((model) => model.slug === value)
              return (
                <Stack
                  direction={'row'}
                  width={160}
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
                    {findModal?.title || 'Select model'}
                  </Typography>
                  {findModal?.tags
                    ?.filter((t) => t === 'beta')
                    ?.map((tag) => {
                      return (
                        <Chip
                          key={tag}
                          sx={{
                            ml: 1,
                            textTransform: 'capitalize',
                            flexShrink: 0,
                            fontSize: '14px',
                          }}
                          label={tag}
                          color="primary"
                          size={'small'}
                          variant={'outlined'}
                        />
                      )
                    })}
                </Stack>
              )
            }}
          >
            {memoModels.map((model) => {
              const isDisabled = !WHITE_LIST_MODELS.includes(model.slug)
              return (
                <MenuItem
                  disabled={isDisabled}
                  value={model.slug}
                  key={model?.slug}
                  sx={{
                    p: 0,
                    pointerEvents: 'auto!important',
                  }}
                >
                  <Tooltip
                    placement={'right-start'}
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
                        <Stack textAlign={'left'} width={'100%'} spacing={1}>
                          <Typography
                            fontSize={'14px'}
                            color={'text.primary'}
                            textAlign={'left'}
                            fontWeight={700}
                          >
                            Model disabled in extension for upgrade. Please try
                            later.
                          </Typography>
                          <Typography
                            fontSize={'14px'}
                            color={'text.primary'}
                            textAlign={'left'}
                          >
                            {model?.title}
                          </Typography>
                          <Stack
                            direction={'row'}
                            flexWrap={'wrap'}
                            gap={'4px'}
                          >
                            {model?.tags?.map((tag) => {
                              return (
                                <Chip
                                  sx={{
                                    fontSize: '12px',
                                    height: '18px',
                                    textTransform: 'capitalize',
                                    flexShrink: 0,
                                    '& > span': {
                                      px: '6px',
                                    },
                                  }}
                                  key={tag}
                                  label={tag}
                                  color="primary"
                                  size={'small'}
                                  variant={'outlined'}
                                />
                              )
                            })}
                          </Stack>
                        </Stack>
                        <Typography
                          fontSize={'12px'}
                          color={'text.primary'}
                          textAlign={'left'}
                        >
                          {model?.description}
                        </Typography>
                        {model?.qualitative_properties &&
                          Object.keys(model?.qualitative_properties).map(
                            (key) => {
                              const value = (model as any)
                                ?.qualitative_properties?.[key]
                              if (Array.isArray(value)) {
                                return (
                                  <Typography
                                    fontSize={'12px'}
                                    color={'text.secondary'}
                                    textAlign={'left'}
                                    key={key}
                                  >
                                    <span
                                      style={{
                                        width: '80px',
                                        textTransform: 'capitalize',
                                      }}
                                    >
                                      {key}:
                                    </span>
                                    <Stack
                                      component={'span'}
                                      direction={'row'}
                                      alignItems={'center'}
                                      spacing={0.5}
                                    >
                                      {Array(value[1] || 5)
                                        .fill(value[1])
                                        .map((v, index) => {
                                          return (
                                            <Box
                                              key={index}
                                              component={'span'}
                                              sx={{
                                                width: '20px',
                                                height: '8px',
                                                borderRadius: '4px',
                                                backgroundColor:
                                                  index < value[0]
                                                    ? 'primary.main'
                                                    : 'rgb(217,217,217)',
                                              }}
                                            />
                                          )
                                        })}
                                    </Stack>
                                  </Typography>
                                )
                              }
                              return null
                            },
                          )}
                      </Stack>
                    }
                  >
                    <Stack
                      width={160}
                      sx={{ padding: '6px 16px' }}
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
                        {model?.title || 'Select model'}
                      </Typography>
                      {model?.tags
                        ?.filter((t) => t === 'beta')
                        ?.map((tag) => {
                          return (
                            <Chip
                              sx={{
                                ml: 1,
                                textTransform: 'capitalize',
                                fontSize: '14px',
                                flexShrink: 0,
                              }}
                              key={tag}
                              label={tag}
                              color="primary"
                              size={'small'}
                              variant={'outlined'}
                            />
                          )
                        })}
                    </Stack>
                  </Tooltip>
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      ) : (
        <Typography fontSize={12} color={'text.secondary'}>
          GPT-4 is only available in ChatGPT Plus
        </Typography>
      )}
    </>
  )
}
export { ChatGPTOpenAIModelSelector }
