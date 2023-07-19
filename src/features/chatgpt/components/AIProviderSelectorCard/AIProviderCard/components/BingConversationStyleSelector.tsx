import React, { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import {
  BING_CONVERSATION_STYLES,
  BingConversationStyle,
} from '@/background/src/chat/BingChat/bing/types'
import useEffectOnce from '@/hooks/useEffectOnce'
import {
  getThirdProviderSettings,
  setThirdProviderSettings,
} from '@/background/src/chat/util'
import { useFocus } from '@/hooks/useFocus'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'

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

const BingConversationStyleSelector: FC = () => {
  const { cleanChatGPT } = useCleanChatGPT()
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const [bingConversationStyle, setBingConversationStyle] = useState(
    BingConversationStyle.Balanced,
  )
  useEffectOnce(() => {
    getThirdProviderSettings('BING').then((bingSettings) => {
      if (bingSettings?.conversationStyle) {
        setBingConversationStyle(bingSettings.conversationStyle)
      }
    })
  })
  useFocus(() => {
    getThirdProviderSettings('BING').then((bingSettings) => {
      if (bingSettings?.conversationStyle) {
        setBingConversationStyle(bingSettings.conversationStyle)
      }
    })
  })
  return (
    <FormControl
      size="small"
      sx={{
        height: 40,
      }}
    >
      <InputLabel
        sx={{
          fontSize: '16px',
        }}
        id={'BingConversationStyleSelectorLabel'}
      >
        <span style={{ fontSize: '16px' }}>{'Conversation style'}</span>
      </InputLabel>
      <Select
        disabled={chatGPTConversationLoading}
        MenuProps={{
          elevation: 0,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          MenuListProps: {
            sx: {
              border: `1px solid`,
              borderColor: 'customColor.borderColor',
            },
          },
        }}
        sx={{
          fontSize: '14px',
          '& > fieldset': {
            '& > legend': {
              span: {
                width: 110,
              },
            },
          },
        }}
        IconComponent={ArrowDropDownIconCustom}
        labelId={'BingConversationStyleSelectorLabel'}
        label={'Conversation style'}
        value={bingConversationStyle}
        onChange={async (event) => {
          try {
            await setThirdProviderSettings(
              'BING',
              {
                conversationStyle: event.target.value as BingConversationStyle,
              },
              false,
            )
            await cleanChatGPT()
            setBingConversationStyle(
              event.target.value as BingConversationStyle,
            )
          } catch (e) {
            console.error(e)
          }
        }}
        renderValue={(value) => {
          const findModal = BING_CONVERSATION_STYLES.find(
            (model) => model.value === value,
          )
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
        {BING_CONVERSATION_STYLES.map((model) => {
          return (
            <MenuItem value={model.value} key={model?.value} sx={{ p: 0 }}>
              <Tooltip
                placement={'left'}
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
export default BingConversationStyleSelector
