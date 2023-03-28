import React, { FC, useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  ChatGPTMessageState,
} from '@/features/gmail/store'
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

const ArrowDropDownIconCustom = () => {
  return (
    <ArrowDropDownIcon
      sx={{
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '16px',
        position: 'absolute',
        right: '8px',
        top: 'calc(50% - 8px)',
      }}
    />
  )
}

const ChatGPTModelsSelector: FC = () => {
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  const [models, setModels] = React.useState<IChatGPTModelType[]>([])
  const [currentModel, setCurrentModel] = React.useState<string>('')
  const setConversation = useSetRecoilState(ChatGPTConversationState)
  const setMessages = useSetRecoilState(ChatGPTMessageState)
  const prevModel = useRef<string>('')
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
  useEffect(() => {
    if (
      prevModel.current !== undefined &&
      prevModel.current &&
      prevModel.current !== currentModel
    ) {
      console.log('Value changed from', prevModel.current, 'to', currentModel)
      setConversation({
        model: currentModel,
        lastMessageId: '',
        writingMessage: null,
        conversationId: '',
        loading: false,
      })
      setMessages([])
    }
    prevModel.current = currentModel
  }, [currentModel])
  return (
    <>
      {models.length > 1 && (
        <FormControl size="small" sx={{ ml: 1, mt: 2, height: 40 }}>
          <InputLabel
            sx={{ fontSize: '16px' }}
            id={'ChatGPTModelsSelectorLabel'}
          >
            <span style={{ fontSize: '16px' }}>Model</span>
          </InputLabel>
          <Select
            MenuProps={{
              elevation: 0,
              sx: {
                border: `1px solid rgba(0, 0, 0, 0.23)`,
              },
            }}
            sx={{ fontSize: '14px' }}
            IconComponent={ArrowDropDownIconCustom}
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
