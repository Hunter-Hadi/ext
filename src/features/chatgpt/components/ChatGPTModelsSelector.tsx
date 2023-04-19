import React, { FC, useMemo } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import uniqBy from 'lodash-es/uniqBy'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AppSettingsState } from '@/store'
import { useMessageWithChatGPT } from '@/features/chatgpt'
import { setChromeExtensionSettings } from '@/background/utils'
import { ChatGPTConversationState } from '@/features/gmail'

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

const ChatGPTModelsSelector: FC = () => {
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
  return (
    <>
      {memoModels.length > 1 && (
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
            value={appSettings.currentModel || memoModels[0]}
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
            renderValue={(value) => (
              <Typography
                fontSize={14}
                color={'text.primary'}
                width={160}
                noWrap
              >
                {memoModels.find((model) => model.slug === value)?.title ||
                  'select model'}
              </Typography>
            )}
          >
            {memoModels.map((model) => {
              return (
                <MenuItem value={model.slug} key={model?.slug} sx={{ p: 0 }}>
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
                        <Typography
                          fontSize={'14px'}
                          color={'text.primary'}
                          textAlign={'left'}
                        >
                          {model?.title}
                        </Typography>
                        <Typography
                          fontSize={'12px'}
                          color={'text.secondary'}
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
                    <Typography
                      textAlign={'left'}
                      width={160}
                      noWrap
                      sx={{ padding: '6px 16px' }}
                      fontSize={'14px'}
                      color={'text.primary'}
                    >
                      {model?.title}
                    </Typography>
                  </Tooltip>
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      )}
    </>
  )
}
export { ChatGPTModelsSelector }
