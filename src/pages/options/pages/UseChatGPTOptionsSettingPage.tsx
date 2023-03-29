import { FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import { getChromeExtensionSettings, setChromeExtensionSettings } from '@/utils'
import AppLoadingLayout from '@/components/LoadingLayout'
import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/types'

const UseChatGPTOptionsSettingPage = () => {
  const [userSettings, setUserSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setChromeExtensionSettings({
      userSettings,
    })
  }, [userSettings])
  useEffect(() => {
    getChromeExtensionSettings().then((res) => {
      console.log('settings', res.userSettings)
      setUserSettings(
        res.userSettings || {
          language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
          selectionButtonVisible: true,
        },
      )
      setLoading(false)
    })
  }, [])
  return (
    <AppLoadingLayout loading={loading}>
      <Stack
        sx={{
          width: 500,
          mx: 'auto!important',
        }}
      >
        <Typography fontSize={20} fontWeight={700}>
          AI output language
        </Typography>
        <Typography fontSize={14}>
          The language used in ChatGPT response.{' '}
          <em className="italic">Auto</em> is recommended.
        </Typography>
        <LanguageSelect
          defaultValue={userSettings.language}
          onChange={(newLanguage) => {
            setUserSettings({
              ...userSettings,
              language: newLanguage,
            })
          }}
        />
        <Typography fontSize={20} fontWeight={700}>
          UseChatGPT.AI Show/Hide
        </Typography>
        <Typography fontSize={14}>
          The language used in ChatGPT response.
        </Typography>
        <FormControlLabel
          checked={userSettings.selectionButtonVisible}
          onChange={(e: any) => {
            setUserSettings({
              ...userSettings,
              selectionButtonVisible: e.target.checked,
            })
          }}
          control={<Switch />}
          label="visible"
        />
      </Stack>
    </AppLoadingLayout>
  )
}
export default UseChatGPTOptionsSettingPage
