import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useRef, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import TextSelectPopupSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/TextSelectPopupSetting'
import UseChatGPTContextMenuSettings from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import CloseAlert from '@/components/CloseAlert'
import ColorSchemaSelect from '@/components/select/ColorSchemaSelect'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import {
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import useCommands from '@/hooks/useCommands'
import ManageShortcutHelper from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ManageShortcutHelper'
import SyncSettingCheckerWrapper from '@/pages/options/components/SyncSettingCheckerWrapper'
import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import useEffectOnce from '@/hooks/useEffectOnce'
import HowToFindSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/HowToFindSettings'
import ReferralInviteCard from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ReferralInviteCard'
import ChatGPTStableModeSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ChatGPTStableModeSetting'
import ChatGPTApiSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ChatGPTApiSettings'
import OptionsPageDirectory from '@/pages/options/components/OptionsPageDirectory'

const UseChatGPTOptionsSettingPage = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const [loaded, setLoaded] = useState(false)
  const userSettingsRef = useRef<any>({})
  const [saving, setSaving] = useState(false)
  const { shortCutKey } = useCommands()
  const { syncLocalToServer } = useSyncSettingsChecker()
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
      await syncLocalToServer()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }
  useEffectOnce(() => {
    getChromeExtensionSettings().then((settings) => {
      userSettingsRef.current = settings.userSettings
      setLoaded(true)
    })
  })
  return (
    <SyncSettingCheckerWrapper>
      <AppLoadingLayout loading={!loaded}>
        <Stack
          direction={'row'}
          justifyContent={'center'}
          spacing={2}
          mx={'auto'}
        >
          <OptionsPageDirectory containerId={'optionsPageSettingsPage'} />
          <Stack
            id={'optionsPageSettingsPage'}
            sx={{
              flexShrink: 0,
              width: 600,
            }}
          >
            <HowToFindSettings />
            <ReferralInviteCard />
            <Divider sx={{ my: 4 }} />
            <Typography
              fontSize={20}
              fontWeight={700}
              mb={1}
              id={'shortcut-for-quick-access'}
              component={'h2'}
            >
              Shortcut for quick access
            </Typography>
            <ManageShortcutHelper shortCutKey={shortCutKey} />
            <Divider sx={{ my: 4 }} />
            {/* <Box> */}
            <Typography
              fontSize={20}
              fontWeight={700}
              mb={1}
              component={'h2'}
              id={'appearance'}
            >
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
            <Divider sx={{ my: 4 }} />
            <Typography
              fontSize={20}
              fontWeight={700}
              mb={2}
              component={'h2'}
              id={'ai-output-language'}
            >
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
            <ChatGPTStableModeSetting
              defaultValue={userSettingsRef.current.chatGPTStableModeDuration}
              onChange={async (newDuration) => {
                await updateChromeExtensionSettings(
                  'chatGPTStableModeDuration',
                  newDuration,
                )
              }}
            />
            <Divider sx={{ my: 4 }} />
            <ChatGPTApiSettings />
            <Divider sx={{ my: 4 }} />
            <Typography
              fontSize={20}
              fontWeight={700}
              color={'text.primary'}
              component={'h2'}
              id={'text-select-popup'}
            >
              Text-select-popup
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
              commandKey={shortCutKey}
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
              onUpdated={async () => {
                await syncLocalToServer()
              }}
            />
          </Stack>
        </Stack>
      </AppLoadingLayout>
    </SyncSettingCheckerWrapper>
  )
}

export default UseChatGPTOptionsSettingPage
