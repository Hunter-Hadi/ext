import React, { FC, useEffect, useState } from 'react'
import {
  Typography,
  Stack,
  Link,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Slider,
} from '@mui/material'
import CloseAlert from '@/components/CloseAlert'
import { IOpenAIApiSettingsType } from '@/background/src/chat/OpenAiApiChat/types'
import useEffectOnce from '@/hooks/useEffectOnce'
import {
  getOpenAIApiSettings,
  setOpenAIApiSettings,
} from '@/background/src/chat/OpenAiApiChat/utils'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import BulletList from '@/components/BulletList'
import { BaseSelect } from '@/components/select'
import { OPENAI_API_MODELS } from '@/types'
import { list2Options } from '@/utils/dataHelper/arrayHelper'

const models = list2Options(OPENAI_API_MODELS)

const ChatGPTApiSettings: FC = () => {
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [loaded, setLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  useEffectOnce(() => {
    setLoaded(false)
    getOpenAIApiSettings().then((settings) => {
      setSettings(settings)
      setLoaded(true)
    })
  })
  useEffect(() => {
    if (loaded) {
      setOpenAIApiSettings(settings)
    }
  }, [settings, loaded])
  return (
    <Stack>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        id={'chatgpt-api-settings'}
        mb={1}
      >
        ChatGPT API key
      </Typography>

      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Tips:
          </Typography>
          <BulletList
            textProps={{
              fontSize: 14,
            }}
            textList={[
              `The official OpenAI API is more stable than the ChatGPT free plan. However, charges based on usage do apply.`,
              `Your API Key is saved locally on your browser and not transmitted anywhere else.`,
              <Typography
                fontSize={14}
                key={'error'}
                color={'rgb(211, 47, 47)'}
              >
                If you provide an API key enabled with GPT-4, the extension will
                support GPT-4.
              </Typography>,
              <Stack key={'api'} sx={{ display: 'inline' }}>
                <Typography fontSize={14} component={'span'}>
                  {`Your free OpenAI API key could expire at some point, therefore please `}
                </Typography>
                <Link
                  component={'a'}
                  fontSize={14}
                  rel={'noreferrer noopener nofollow'}
                  href={'https://platform.openai.com/account/usage'}
                  target={'_blank'}
                >
                  {`check the expiration status of your API key here.`}
                </Link>
              </Stack>,
              'Access to ChatGPT may be unstable when demand is high for free OpenAI API key.',
            ]}
          />
        </Stack>
      </CloseAlert>
      <CloseAlert icon={<></>} severity={'info'} sx={{ mt: 2 }}>
        <Stack spacing={1}>
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            How to obtain your OpenAI API key:
          </Typography>
          <Stack sx={{ display: 'inline' }}>
            <Typography fontSize={14} component={'span'}>
              {`1. Sign in to your OpenAI account. If you do not have an account, `}
            </Typography>
            <Link
              fontSize={14}
              target={'_blank'}
              rel={`noreferrer noopener nofollow`}
              href={'https://platform.openai.com/signup'}
            >{`click here`}</Link>
            <Typography fontSize={14} component={'span'}>
              {` to sign up.`}
            </Typography>
          </Stack>
          <Typography fontSize={14} component={'span'}></Typography>
          <Stack sx={{ display: 'inline' }}>
            <Typography fontSize={14} component={'span'}>
              {`2. Visit the `}
            </Typography>
            <Link
              fontSize={14}
              target={'_blank'}
              rel={`noreferrer noopener nofollow`}
              href={'https://platform.openai.com/account/api-keys'}
            >{`OpenAI API keys page`}</Link>
            <Typography fontSize={14} component={'span'}>
              {`.`}
            </Typography>
          </Stack>
          <Stack
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.paper',
              px: 2,
              py: 4,
              borderRadius: '4px',
            }}
          >
            <img
              src={
                'https://www.usechatgpt.ai/assets/chrome-extension/open-key-create.png'
              }
              alt={'open-key-create'}
              width={'460'}
              height={'auto'}
            />
          </Stack>
          <Typography fontSize={14} component={'span'}>
            {`3. Create a new secret key and copy & paste it into the "API key" input field below.👇`}
          </Typography>
        </Stack>
      </CloseAlert>
      <AppLoadingLayout loading={!loaded}>
        <Paper
          sx={{
            mt: 2,
            border: `1px solid`,
            borderColor: 'customColor.borderColor',
          }}
          elevation={0}
        >
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
                    API key
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
                    API host
                  </Stack>
                ),
              }}
            />
            <BaseSelect
              label={'Model'}
              options={models}
              value={settings.apiModel}
              onChange={(value) => {
                setSettings((prevState) => {
                  return {
                    ...prevState,
                    apiModel: value as string,
                  }
                })
              }}
            />
            <Stack>
              <Typography fontSize={14} fontWeight={700}>
                {`Temperature (conversation style): `}
                {settings.temperature}
              </Typography>
              <Slider
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
                onChange={(e, value) => {
                  setSettings((prevState) => {
                    return {
                      ...prevState,
                      temperature: value as number,
                    }
                  })
                }}
                sx={{
                  width: 'calc(100% - 40px)',
                  ml: 2,
                  mr: 2,
                }}
              />
            </Stack>
          </Stack>
        </Paper>
      </AppLoadingLayout>
    </Stack>
  )
}

export default ChatGPTApiSettings
