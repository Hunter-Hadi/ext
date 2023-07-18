import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useRef, useState } from 'react'
import LanguageSelect from '@/components/select/LanguageSelect'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import TextSelectPopupSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/TextSelectPopupSetting'
import UseChatGPTContextMenuSettings from '@/pages/options/pages/UseChatGPTOptionsEditMenuPage/UseChatGPTContextMenuSettings'
import defaultContextMenuJson from '@/background/defaultPromptsData/defaultContextMenuJson'
import CloseAlert from '@/components/CloseAlert'
import ColorSchemaSelect from '@/components/select/ColorSchemaSelect'
import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import {
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import useCommands from '@/hooks/useCommands'
import ManageShortcutHelper from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ManageShortcutHelper'
import SyncSettingCheckerWrapper from '@/pages/options/components/SyncSettingCheckerWrapper'
import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import HowToFindSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/HowToFindSettings'
import ReferralInviteCard from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ReferralInviteCard'
import ChatGPTStableModeSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ChatGPTStableModeSetting'
import ChatGPTApiSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ChatGPTApiSettings'
import OptionsPageDirectory from '@/pages/options/components/OptionsPageDirectory'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import PDFSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/PDFSettings'
import ChatGPTGmailAssistantSetting from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ChatGPTGmailAssistantSetting'
// import ShortcutHintSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/ShortcutHintSettings'

const UseChatGPTOptionsSettingPage = () => {
  const [, setAppSettings] = useRecoilState(AppSettingsState)
  const [loaded, setLoaded] = useState(false)
  const userSettingsRef = useRef<any>({})
  const [saving, setSaving] = useState(false)
  const { chatBoxShortCutKey } = useCommands()
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
  const initUserSettings = async () => {
    const settings = await getChromeExtensionSettings()
    userSettingsRef.current = settings.userSettings
    setLoaded(true)
  }
  return (
    <SyncSettingCheckerWrapper onLoad={initUserSettings}>
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
            <YoutubePlayerBox
              borderRadius={8}
              youtubeLink={'https://www.youtube.com/embed/qiJPoBj8dnE'}
            />
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
            <ManageShortcutHelper shortCutKey={chatBoxShortCutKey} />
            {/*TODO: 临时禁用placeholder hint*/}
            {/*<Divider sx={{ my: 4 }} />*/}
            {/*<ShortcutHintSettings*/}
            {/*  defaultValue={userSettingsRef.current.shortcutHintEnable}*/}
            {/*  onChange={async (enable: boolean) => {*/}
            {/*    await updateChromeExtensionSettings(*/}
            {/*      'shortcutHintEnable',*/}
            {/*      enable,*/}
            {/*    )*/}
            {/*  }}*/}
            {/*/>*/}
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
              id={'ai-response-language'}
            >
              AI response language
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
              label={'AI response language'}
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
            <PDFSettings
              defaultValue={userSettingsRef.current.pdf}
              onChange={async (enabled: boolean) => {
                await updateChromeExtensionSettings('pdf', {
                  enabled,
                })
              }}
            />
            <Divider sx={{ my: 4 }} />
            <ChatGPTApiSettings />
            <Divider sx={{ my: 4 }} />
            <TextSelectPopupSetting commandKey={chatBoxShortCutKey} />
            <Divider sx={{ my: 4 }} />
            <UseChatGPTContextMenuSettings
              iconSetting
              buttonKey={'textSelectPopupButton'}
              defaultContextMenuJson={defaultContextMenuJson}
              onUpdated={async () => {
                await syncLocalToServer()
              }}
            />
            <Divider sx={{ my: 4 }} />
            <ChatGPTGmailAssistantSetting />
            <Stack mb={'40vh'}></Stack>
          </Stack>
        </Stack>
      </AppLoadingLayout>
    </SyncSettingCheckerWrapper>
  )
}

export default UseChatGPTOptionsSettingPage
