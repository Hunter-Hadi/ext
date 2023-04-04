import { Box, Divider, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import { getChromeExtensionSettings, setChromeExtensionSettings } from '@/utils'
import AppLoadingLayout from '@/components/LoadingLayout'
import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/types'
import TextSelectPopupSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/TextSelectPopupSetting'
import UseChatGPTContextMenuSettings from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import CloseAlert from '@/components/CloseAlert'
import ColorSchemaSelect from '@/components/select/ColorSchemaSelect'
import { AppSettingsState } from '@/store'
import { useRecoilState } from 'recoil'

const UseChatGPTOptionsSettingPage = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [userSettings, setUserSettings] = useState<any>({
    language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
    selectionButtonVisible: true,
  })
  const [loaded, setLoaded] = useState(false)
  const [commandKey, setCommandKey] = useState('')
  useEffect(() => {
    if (loaded) {
      setChromeExtensionSettings({
        userSettings,
        colorSchema: appSettings.colorSchema,
      })
    }
  }, [loaded, userSettings, appSettings.colorSchema])
  useEffect(() => {
    getChromeExtensionSettings().then((res) => {
      console.log('settings', res.userSettings?.selectionButtonVisible)
      console.log('settings', res.userSettings?.language)
      const command = res.commands?.find(
        (command) => command.name === '_execute_action',
      )
      if (command) {
        setCommandKey(command.shortcut || '')
      }

      // if (res.colorSchema) {
      //   setAppSettings(pre => )
      // }

      setUserSettings((prevState: any) => {
        return {
          ...prevState,
          ...res.userSettings,
        }
      })
      setTimeout(() => {
        setLoaded(true)
      }, 1000)
    })
  }, [])

  return (
    <AppLoadingLayout loading={!loaded}>
      <Stack
        sx={{
          width: 600,
          mx: 'auto!important',
        }}
      >
        <Box mb={2}>
          <Typography fontSize={20} fontWeight={700} mb={1}>
            Theme Mode
          </Typography>
          <ColorSchemaSelect
            defaultValue={appSettings.colorSchema}
            onChange={(value) =>
              setAppSettings((preValue) => ({
                ...preValue,
                colorSchema: value,
              }))
            }
          />
        </Box>
        <Typography fontSize={20} fontWeight={700} mb={2}>
          AI output language
        </Typography>
        <CloseAlert
          icon={<></>}
          sx={{
            // bgcolor: '#E2E8F0',
            mt: 1,
            mb: 2,
          }}
        >
          <Stack>
            <Typography fontSize={14} color={'text.primary'}>
              {`Choose the default language for Al response.`}
            </Typography>
            <Typography fontSize={14} color={'text.primary'}>
              {`If you select "Auto", the Al will respond in the same language variety or dialect as the selected text.`}
            </Typography>
          </Stack>
        </CloseAlert>
        <LanguageSelect
          label={'AI output language'}
          defaultValue={userSettings.language}
          onChange={async (newLanguage) => {
            setUserSettings({
              ...userSettings,
              language: newLanguage,
            })
          }}
        />
        <Divider sx={{ my: 4 }} />
        <Typography fontSize={20} fontWeight={700} color={'text.primary'}>
          Text select popup
        </Typography>
        <CloseAlert
          icon={<></>}
          sx={{
            // bgcolor: '#E2E8F0',
            mt: 1,
            mb: 2,
          }}
        >
          <Typography fontSize={14} color={'text.primary'}>
            Change visibility
          </Typography>
        </CloseAlert>
        <TextSelectPopupSetting
          commandKey={commandKey}
          visible={userSettings.selectionButtonVisible}
          onChange={async (visible) => {
            setUserSettings({
              ...userSettings,
              selectionButtonVisible: visible,
            })
          }}
        />
        <Divider sx={{ my: 4 }} />
        <UseChatGPTContextMenuSettings
          iconSetting
          settingsKey={'contextMenus'}
          defaultContextMenuJson={defaultContextMenuJson}
        />
      </Stack>
    </AppLoadingLayout>
  )
}
export default UseChatGPTOptionsSettingPage
