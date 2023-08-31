import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import ContextMenuEditCard from '@/pages/settings/pages/prompts/ContextMenuEditCard'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'

const EditButtonKey: IChromeExtensionButtonSettingKey = 'textSelectPopupButton'
const SettingsPromptsPage: FC = () => {
  const { syncLocalToServer } = useSyncSettingsChecker()
  const { t } = useTranslation(['settings'])
  const { buttonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__prompts__title')}
      id={'my-own-prompts'}
    >
      <Stack>
        <FormControlLabel
          checked={
            buttonSettings?.[EditButtonKey].contextMenuPosition === 'end'
          }
          control={<Switch />}
          onChange={async (event, checked) => {
            if (buttonSettings?.[EditButtonKey]) {
              await updateButtonSettings(
                EditButtonKey,
                {
                  ...buttonSettings[EditButtonKey],
                  contextMenuPosition: checked ? 'end' : 'start',
                },
                true,
              )
            }
          }}
          label={t(
            'settings:feature_card__prompts__place_my_own_prompts_switch',
          )}
        />
        <ContextMenuEditCard
          position={
            buttonSettings?.[EditButtonKey].contextMenuPosition || 'start'
          }
          iconSetting
          buttonKey={EditButtonKey}
          onUpdated={async () => {
            await syncLocalToServer()
          }}
        />
      </Stack>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsPromptsPage
