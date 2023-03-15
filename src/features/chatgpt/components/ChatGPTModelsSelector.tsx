import React, { FC, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { GmailMessageChatConversationState } from '@/features/gmail/store'
import {
  getChromeExtensionSettings,
  IChatGPTModelType,
  setChromeExtensionSettings,
} from '@/utils'
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

const ChatGPTModelsSelector: FC = () => {
  const updateConversation = useSetRecoilState(
    GmailMessageChatConversationState,
  )
  const [models, setModels] = React.useState<IChatGPTModelType[]>([])
  const [currentModel, setCurrentModel] = React.useState<string>('')
  useEffect(() => {
    let isDestroyed = false
    getChromeExtensionSettings().then((settings) => {
      if (isDestroyed) return
      if (settings.models) {
        setModels(uniqBy(settings.models, 'slug'))
      }
      if (settings?.currentModel) {
        setCurrentModel(settings.currentModel)
        updateConversation((conversation) => {
          return {
            ...conversation,
            model: settings.currentModel || '',
          }
        })
      }
    })
    return () => {
      isDestroyed = true
    }
  }, [])
  return (
    <>
      {models.length > 1 && (
        <FormControl size="small" sx={{ ml: 1, mt: 2, height: 40 }}>
          <InputLabel id={'ChatGPTModelsSelectorLabel'}>
            <span style={{ fontSize: '16px' }}>Model</span>
          </InputLabel>
          <Select
            labelId={'ChatGPTModelsSelectorLabel'}
            label={'Model'}
            value={currentModel}
            onChange={async (event) => {
              await setChromeExtensionSettings({
                currentModel: event.target.value as string,
              })
              setCurrentModel(event.target.value as string)
              updateConversation((conversation) => {
                return {
                  ...conversation,
                  model: event.target.value || '',
                }
              })
            }}
            renderValue={(value) => (
              <Typography
                fontSize={14}
                color={'text.primary'}
                width={160}
                noWrap
              >
                {models.find((model) => model.slug === value)?.title ||
                  'select model'}
              </Typography>
            )}
          >
            {models.map((model) => {
              return (
                <MenuItem value={model.slug} key={model?.slug} sx={{ p: 0 }}>
                  <Tooltip
                    placement={'right-start'}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          border: '1px solid rgb(245,245,245)',
                          backgroundColor: '#fff',
                          p: 1,
                        },
                      },
                    }}
                    title={
                      <Stack spacing={1} width={'160px'}>
                        <Typography
                          fontSize={'14px'}
                          fontWeight={'bold'}
                          color={'text.primary'}
                          textAlign={'left'}
                        >
                          {model?.title}
                        </Typography>
                        <Typography
                          fontSize={'12px'}
                          fontWeight={'bold'}
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
                                    fontWeight={'bold'}
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
                      width={160}
                      noWrap
                      sx={{ padding: '6px 16px' }}
                      fontSize={'14px'}
                      fontWeight={'bold'}
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
