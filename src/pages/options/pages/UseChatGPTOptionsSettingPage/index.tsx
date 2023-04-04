import { Divider, Stack, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import { getChromeExtensionSettings, setChromeExtensionSettings } from '@/utils'
import AppLoadingLayout from '@/components/LoadingLayout'
import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/types'
import TextSelectPopupSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/TextSelectPopupSetting'
import UseChatGPTContextMenuSettings from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import CloseAlert from '@/components/CloseAlert'
import ColorSchemaSelect from '@/components/select/ColorSchemaSelect'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'

const UseChatGPTOptionsSettingPage = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const userSettingsRef = useRef<any>({})
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [commandKey, setCommandKey] = useState('')
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
      userSettingsRef.current = {
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        selectionButtonVisible: true,
        ...res.userSettings,
      }
      console.log('!!!!userSettings', userSettingsRef.current)
      setLoaded(true)
    })
  }, [])
  const updateChromeExtensionSettings = async (key: string, value: any) => {
    try {
      console.log(saving)
      setSaving(true)
      userSettingsRef.current = {
        ...userSettingsRef.current,
        [key]: value,
      }
      await setChromeExtensionSettings({
        userSettings: userSettingsRef.current,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLoadingLayout loading={!loaded}>
      <Stack
        sx={{
          width: 600,
          mx: 'auto!important',
        }}
      >
        {/* <Box> */}
        <Typography fontSize={20} fontWeight={700} mb={1}>
          Appearance
        </Typography>
        <ColorSchemaSelect
          defaultValue={userSettingsRef.current.colorSchema}
          onChange={async (newTheme) => {
            await updateChromeExtensionSettings('colorSchema', newTheme)
            setAppSettings((prevState) => {
              return {
                ...prevState,
                userSettings: userSettingsRef.current,
              }
            })
          }}
        />
        {/* </Box> */}
        <Divider sx={{ my: 4 }} />
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
          defaultValue={userSettingsRef.current.language}
          onChange={async (newLanguage) => {
            await updateChromeExtensionSettings('language', newLanguage)
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
          visible={userSettingsRef.current.selectionButtonVisible}
          onChange={async (visible) => {
            await updateChromeExtensionSettings(
              'selectionButtonVisible',
              visible,
            )
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
