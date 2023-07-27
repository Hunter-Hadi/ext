import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

import { IOpenAIApiSettingsType } from '@/background/src/chat/OpenAIApiChat/types'
import useEffectOnce from '@/hooks/useEffectOnce'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useSnackbar } from 'notistack'
import debounce from 'lodash-es/debounce'
import {
  getThirdProviderSettings,
  setThirdProviderSettings,
} from '@/background/src/chat/util'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import { OpenInNewOutlined } from '@mui/icons-material'

const ChatGPTApiSettings: FC = () => {
  const { t } = useTranslation(['settings'])
  const { enqueueSnackbar } = useSnackbar()
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [loaded, setLoaded] = useState(false)
  const once = useRef(true)
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const debounceEnqueueSnackbar = useCallback(
    debounce((message: string, options?: any) => {
      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: 1000,
        ...options,
      })
    }, 2000),
    [enqueueSnackbar],
  )
  useEffectOnce(() => {
    setLoaded(false)
    getThirdProviderSettings('OPENAI_API').then((settings) => {
      setSettings(settings as any)
      setLoaded(true)
    })
  })
  useEffect(() => {
    if (loaded) {
      setThirdProviderSettings('OPENAI_API', settings, true).then(() => {
        if (once.current) {
          once.current = false
          return
        }
        debounceEnqueueSnackbar('Settings updated', {
          variant: 'success',
          autoHideDuration: 1000,
        })
      })
    }
  }, [settings, loaded])
  return (
    <Stack>
      <AppLoadingLayout loading={!loaded}>
        <Stack p={2} spacing={2}>
          <TextField
            type={showPassword ? 'text' : 'password'}
            fullWidth
            placeholder={'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
            size={'small'}
            value={settings.apiKey}
            onChange={(e) => {
              setSettings((prevState) => {
                return {
                  ...prevState,
                  apiKey: e.target.value,
                }
              })
            }}
            InputProps={{
              sx: { pl: 0, input: { fontSize: '14px' }, height: 40 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <Stack
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'text.primary',
                    background: 'rgba(0, 0, 0, 0.04)',
                    // border: '1px solid rgba(0, 0, 0, 0.04)',
                    px: 2,
                    mr: 2,
                    boxSizing: 'border-box',
                    flexShrink: 0,
                  }}
                >
                  {t(
                    'settings:feature_card__openai_api_key__field_api_key__title',
                  )}
                </Stack>
              ),
            }}
          />
          <TextField
            type={'text'}
            fullWidth
            placeholder={'https://api.openai.com'}
            size={'small'}
            value={settings.apiHost}
            onChange={(e) => {
              setSettings((prevState) => {
                return {
                  ...prevState,
                  apiHost: e.target.value,
                }
              })
            }}
            InputProps={{
              sx: { pl: 0, input: { fontSize: '14px' }, height: 40 },
              startAdornment: (
                <Stack
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'text.primary',
                    background: 'rgba(0, 0, 0, 0.04)',
                    // border: '1px solid rgba(0, 0, 0, 0.04)',
                    px: 2,
                    mr: 2,
                    boxSizing: 'border-box',
                    flexShrink: 0,
                  }}
                >
                  {t(
                    'settings:feature_card__openai_api_key__field_api_host__title',
                  )}
                </Stack>
              ),
            }}
          />
          <Button
            component={'a'}
            href={'https://platform.openai.com/account/api-keys'}
            target={'_blank'}
            rel={'noreferrer noopener nofollow'}
            sx={{ width: 220 }}
            variant={'contained'}
            endIcon={<OpenInNewOutlined />}
          >
            {t('settings:feature_card__openai_api_key__get_my_openai_api_key')}
          </Button>
        </Stack>
      </AppLoadingLayout>
    </Stack>
  )
}

export default ChatGPTApiSettings
