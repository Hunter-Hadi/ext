import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BING_CONVERSATION_STYLES,
  BingConversationStyle,
} from '@/background/src/chat/BingChat/bing/types'
import {
  getAIProviderSettings,
  setAIProviderSettings,
} from '@/background/src/chat/util'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'

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
  const { t } = useTranslation(['common', 'client'])
  const { resetConversation } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [bingConversationStyle, setBingConversationStyle] = useState(
    BingConversationStyle.Balanced,
  )
  useEffectOnce(() => {
    getAIProviderSettings('BING').then((bingSettings) => {
      if (bingSettings?.conversationStyle) {
        setBingConversationStyle(bingSettings.conversationStyle)
      }
    })
  })
  useFocus(() => {
    getAIProviderSettings('BING').then((bingSettings) => {
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
        <span style={{ fontSize: '16px' }}>
          {t('client:provider__bing_web_app__conversation_style__title')}
        </span>
      </InputLabel>
      <Select
        disabled={smoothConversationLoading}
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
        label={t('client:provider__bing_web_app__conversation_style__title')}
        value={bingConversationStyle}
        onChange={async (event) => {
          try {
            await setAIProviderSettings('BING', {
              conversationStyle: event.target.value as BingConversationStyle,
            })
            await resetConversation()
            setBingConversationStyle(
              event.target.value as BingConversationStyle,
            )
          } catch (e) {
            console.error(e)
          }
        }}
        renderValue={(value) => {
          const currentConversationStyle = BING_CONVERSATION_STYLES.find(
            (conversationStyle) => conversationStyle.value === value,
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
                {currentConversationStyle?.label
                  ? t(currentConversationStyle.label as any)
                  : 'Select conversation style'}
              </Typography>
            </Stack>
          )
        }}
      >
        {BING_CONVERSATION_STYLES.map((conversationStyle) => {
          return (
            <MenuItem
              value={conversationStyle.value}
              key={conversationStyle?.value}
              sx={{ p: 0 }}
            >
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
                        {t(conversationStyle.label as any)}
                      </Typography>
                    </Stack>
                    <Typography
                      fontSize={'12px'}
                      color={'text.primary'}
                      textAlign={'left'}
                    >
                      {t(conversationStyle.description as any)}
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
                    {conversationStyle?.label
                      ? t(conversationStyle.label as any)
                      : 'Select conversation style'}
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
