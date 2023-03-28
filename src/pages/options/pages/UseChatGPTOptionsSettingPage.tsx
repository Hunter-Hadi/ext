import { Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import { getChromeExtensionSettings, setChromeExtensionSettings } from '@/utils'
import AppLoadingLayout from '@/components/LoadingLayout'

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
          language: 'auto',
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
          Language
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
      </Stack>
    </AppLoadingLayout>
  )
}
export default UseChatGPTOptionsSettingPage
