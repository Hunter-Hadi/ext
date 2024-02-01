import { OpenInNewOutlined } from '@mui/icons-material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { isEqual } from 'lodash-es'
import cloneDeep from 'lodash-es/cloneDeep'
import debounce from 'lodash-es/debounce'
import { useSnackbar } from 'notistack'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IOpenAIApiSettingsType } from '@/background/src/chat/OpenAIApiChat/types'
import {
  getAIProviderSettings,
  setAIProviderSettings,
} from '@/background/src/chat/util'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'

const ChatGPTApiSettings: FC = () => {
  const { t } = useTranslation(['settings'])
  const { enqueueSnackbar } = useSnackbar()
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [loaded, setLoaded] = useState(false)
  const init = useRef<boolean>(false)
  const initSettingsRef = useRef<IOpenAIApiSettingsType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const debounceEnqueueSnackbar = useCallback(
    debounce((message: string, options?: any) => {
      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: 1000,
        ...options,
      })
    }, 1000),
    [enqueueSnackbar],
  )
  useEffectOnce(() => {
    setLoaded(false)
    getAIProviderSettings('OPENAI_API').then((settings) => {
      if (settings) {
        initSettingsRef.current = cloneDeep(settings)
        setSettings(settings)
        setLoaded(true)
      }
    })
  })
  const debounceSetSettings = useCallback(
    debounce(setAIProviderSettings, 1000),
    [],
  )
  useEffect(() => {
    if (loaded) {
      if (!init.current) {
        // 深比较
        if (
          initSettingsRef.current &&
          isEqual(initSettingsRef.current, settings)
        ) {
          return
        } else {
          debounceEnqueueSnackbar(t('settings:sync__save_success'), {
            variant: 'success',
          })
          // 第一次加载
          init.current = true
        }
      }
      debounceSetSettings('OPENAI_API', settings)?.then(() => {
        debounceEnqueueSnackbar(t('settings:sync__save_success'), {
          variant: 'success',
        })
      })
    }
  }, [settings, loaded, debounceSetSettings, debounceEnqueueSnackbar, t])
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
            sx={{ width: 320 }}
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
