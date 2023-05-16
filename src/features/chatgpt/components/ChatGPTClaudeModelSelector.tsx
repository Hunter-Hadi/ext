import React, { FC, useMemo } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { AppSettingsState } from '@/store'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { setChromeExtensionSettings } from '@/background/utils'
import { ChatGPTConversationState } from '@/features/gmail/store'
import { POE_MODELS, PoeModel } from '@/background/src/chat/PoeChat/type'

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

const ChatGPTClaudeModelSelector: FC = () => {
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const claudeCurrentModel = useMemo(() => {
    return (
      appSettings.thirdProviderSettings?.CLAUDE?.model || PoeModel.ClaudeInstant
    )
  }, [appSettings.thirdProviderSettings])
  const { resetConversation } = useMessageWithChatGPT('')
  return (
    <FormControl size="small" sx={{ height: 40 }}>
      <InputLabel sx={{ fontSize: '16px' }} id={'ChatGPTModelsSelectorLabel'}>
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
        value={claudeCurrentModel}
        onChange={async (event) => {
          setAppSettings((prevState) => {
            return {
              ...prevState,
              thirdProviderSettings: {
                ...prevState.thirdProviderSettings,
                CLAUDE: {
                  ...prevState.thirdProviderSettings?.CLAUDE,
                  model: event.target.value as string,
                },
              },
            }
          })
          await setChromeExtensionSettings((settings) => {
            return {
              ...settings,
              thirdProviderSettings: {
                ...settings.thirdProviderSettings,
                CLAUDE: {
                  ...settings.thirdProviderSettings?.CLAUDE,
                  model: event.target.value as string,
                },
              },
            }
          })
          await resetConversation()
        }}
        renderValue={(value) => {
          const findModal = POE_MODELS.find((model) => model.value === value)
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
                {findModal?.label || 'Select model'}
              </Typography>
            </Stack>
          )
        }}
      >
        {POE_MODELS.map((model) => {
          return (
            <MenuItem value={model.value} key={model?.value} sx={{ p: 0 }}>
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
                    <Stack
                      direction={'row'}
                      width={'100%'}
                      alignItems={'center'}
                      spacing={1}
                    >
                      <Typography
                        fontSize={'14px'}
                        color={'text.primary'}
                        textAlign={'left'}
                      >
                        {model?.label}
                      </Typography>
                    </Stack>
                    <Typography
                      fontSize={'12px'}
                      color={'text.primary'}
                      textAlign={'left'}
                    >
                      {model?.description}
                    </Typography>
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
                    {model?.label || 'Select model'}
                  </Typography>
                </Stack>
              </Tooltip>
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
export { ChatGPTClaudeModelSelector }
