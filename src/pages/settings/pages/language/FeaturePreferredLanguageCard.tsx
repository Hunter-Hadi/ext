import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import LanguageCodeSelect from '@/components/select/LanguageCodeSelect'
import { updateContextMenuSearchTextStore } from '@/pages/settings/utils'

const FeaturePreferredLanguageCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common', 'prompt'])

  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__preferred_language__title')}
      id={'ai-response-language'}
    >
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          p: '0 !important',
          borderRadius: '4px',
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <ListItem>
          <ListItemText
            primary={t(
              'settings:feature_card__preferred_language__field_preferred_language_title',
            )}
            secondary={t(
              'settings:feature_card__preferred_language__field_preferred_language_description',
            )}
          />
          {userSettings && (
            <LanguageCodeSelect
              sx={{ flexShrink: 0, width: 220, ml: 2 }}
              label={t(
                'settings:feature_card__preferred_language__field_preferred_language_label',
              )}
              defaultValue={userSettings.preferredLanguage}
              onChange={async (newLanguage) => {
                await setUserSettings({
                  ...userSettings,
                  preferredLanguage: newLanguage,
                })
                await updateContextMenuSearchTextStore('textSelectPopupButton')
              }}
            />
          )}
        </ListItem>
      </List>
    </SettingsFeatureCardLayout>
  )
}
export default FeaturePreferredLanguageCard
