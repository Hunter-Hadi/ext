import React, { FC, useEffect, useState } from 'react'
import {
  Typography,
  Stack,
  Link,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Button,
  Slider,
  Box,
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
import SaveIcon from '@mui/icons-material/Save'
import { BaseSelect } from '@/components/select'
import { OPENAI_API_MODELS } from '@/types'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import Modal from '@mui/material/Modal'

const models = list2Options(OPENAI_API_MODELS)

const ChatGPTApiSettings: FC = () => {
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [originalSettings, setOriginalSettings] =
    useState<IOpenAIApiSettingsType>({})
  const [loaded, setLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showOnBoarding, setShowOnBoarding] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  useEffectOnce(() => {
    setLoaded(false)
    getOpenAIApiSettings().then((settings) => {
      setSettings(settings)
      setOriginalSettings(settings)
      setLoaded(true)
    })
  })
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
      <Stack sx={{ display: 'inline' }} mb={2}>
        <Typography fontSize={14} component={'span'}>
          {`The official OpenAI API is more stable and charges are based on usage. `}
        </Typography>
        <Link
          fontSize={14}
          href={'#'}
          onClick={(event) => {
            event.preventDefault()
            setShowOnBoarding(true)
          }}
        >{`Follow the guide to get the API key.`}</Link>
      </Stack>
      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Notice
          </Typography>
          <BulletList
            textProps={{
              fontSize: 14,
            }}
            textList={[
              `Your API Key is stored locally on your browser and never sent anywhere else.`,
              <Typography
                fontSize={14}
                key={'error'}
                color={'rgb(211, 47, 47)'}
              >
                The extension supports GPT-4 if you input a GPT-4 API key.
              </Typography>,
              <Stack key={'api'} sx={{ display: 'inline' }}>
                <Typography fontSize={14} component={'span'}>
                  {`Your free OpenAI API key might have expired. Please `}
                </Typography>
                <Link
                  component={'a'}
                  fontSize={14}
                  rel={'noreferrer noopener nofollow'}
                  href={'https://platform.openai.com/account/usage'}
                  target={'_blank'}
                >
                  {`check the API key expiration status here.`}
                </Link>
              </Stack>,
              'If you use the free OpenAI API key, the access to ChatGPT may not be stable when it experiences high demand.',
            ]}
          />
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
                    Api Key
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
                    Api Host
                  </Stack>
                ),
              }}
            />
            <BaseSelect
              label={'Api Model'}
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
              <Typography fontSize={14}>
                Conversation Style (temperature: {settings.temperature})
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
            <Stack direction={'row'} justifyContent={'end'}>
              <Button
                disabled={!settings.apiKey && originalSettings.apiKey === ''}
                startIcon={<SaveIcon />}
                variant={'contained'}
                color={'primary'}
                onClick={async () => {
                  await setOpenAIApiSettings(settings)
                  setOriginalSettings(settings)
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </AppLoadingLayout>
      <ChatGPTApiSettingsOnBoarding
        open={showOnBoarding}
        onClose={() => {
          setShowOnBoarding(false)
          setLoaded(false)
          getOpenAIApiSettings().then((settings) => {
            setSettings(settings)
            setOriginalSettings(settings)
            setLoaded(true)
          })
        }}
      />
    </Stack>
  )
}

const ChatGPTApiSettingsOnBoarding: FC<{
  open: boolean
  onClose: () => void
}> = (props) => {
  const [settings, setSettings] = useState<IOpenAIApiSettingsType>({})
  const [originalSettings, setOriginalSettings] =
    useState<IOpenAIApiSettingsType>({})
  const [loaded, setLoaded] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  useEffect(() => {
    if (props.open) {
      setLoaded(false)
      getOpenAIApiSettings().then((settings) => {
        setSettings(settings)
        setOriginalSettings(settings)
        setLoaded(true)
      })
    }
  }, [props.open])
  const { open, onClose } = props
  return (
    <Modal open={open} onClose={onClose}>
      <AppLoadingLayout loading={!loaded}>
        <Stack
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 600,
            width: '90%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '4px',
            p: 4,
          }}
        >
          <Stack spacing={2}>
            <Typography fontSize={14}>
              😄Welcome to ChatGPT Sidebar! Here is your journey to begin:
            </Typography>
            <Typography fontSize={24} fontWeight={700}>
              How to get an API key.
            </Typography>
            <Typography fontSize={20} fontWeight={700}>
              Step 1: Get API key
            </Typography>
            <BulletList
              textList={[
                <Box key={'step-1'} display={'inline'}>
                  <Link
                    fontSize={14}
                    rel={`noreferrer noopener nofollow`}
                    href={'https://platform.openai.com/login'}
                    target={'_blank'}
                  >
                    Login your OpenAi account
                  </Link>
                  <Typography
                    fontSize={14}
                    component={'span'}
                  >{` If you don't have an account, Sign up `}</Typography>
                  <Link
                    fontSize={14}
                    rel={`noreferrer noopener nofollow`}
                    href={'https://platform.openai.com/signup'}
                    target={'_blank'}
                  >
                    Here
                  </Link>
                </Box>,
                <Box key={'step-2'} display={'inline'}>
                  <Link
                    fontSize={14}
                    rel={`noreferrer noopener nofollow`}
                    href={'https://platform.openai.com/account/api-keys'}
                    target={'_blank'}
                  >
                    Visit OpenAI API Key page
                  </Link>
                </Box>,
                `Create a new secret key and copy it as follow`,
              ]}
            />
            <img src={`.png`} alt="settings-entry" width={466} height={121} />
            <Stack>
              <Typography fontSize={20} fontWeight={700}>
                Step 2: Paste API Key in the box below
              </Typography>
              <Typography fontSize={14}>
                {`Don't worry. Your API key is only used locally within the ChatGPT
              extension. Using the API is more stable than directly using
              ChatGPT.`}
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems={'center'} spacing={2}>
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
                      Api Key
                    </Stack>
                  ),
                }}
              />
              <Button
                sx={{
                  flexShrink: 0,
                }}
                disabled={!settings.apiKey && originalSettings.apiKey === ''}
                startIcon={<SaveIcon />}
                variant={'contained'}
                color={'primary'}
                onClick={async () => {
                  await setOpenAIApiSettings(settings)
                  setOriginalSettings(settings)
                }}
              >
                Save
              </Button>
            </Stack>
            <Typography fontSize={20} fontWeight={700} component={'span'}>
              {`Step 3: Check your credits `}
              <Link
                rel={`noreferrer noopener nofollow`}
                href={'https://platform.openai.com/account/usage'}
                target={'_blank'}
              >
                here
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </AppLoadingLayout>
    </Modal>
  )
}
export default ChatGPTApiSettings
