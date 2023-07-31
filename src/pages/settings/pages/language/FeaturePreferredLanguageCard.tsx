import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import List from '@mui/material/List'
import { ListItem } from '@mui/material'
import ListItemText from '@mui/material/ListItemText'
import LanguageSelect from '@/components/select/LanguageSelect'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeaturePreferredLanguageCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
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
            <LanguageSelect
              sx={{ flexShrink: 0, width: 220, ml: 2 }}
              label={t(
                'settings:feature_card__preferred_language__field_preferred_language_label',
              )}
              defaultValue={userSettings.language}
              onChange={async (newLanguage) => {
                await setUserSettings({
                  ...userSettings,
                  language: newLanguage,
                })
              }}
            />
          )}
        </ListItem>
      </List>
    </SettingsFeatureCardLayout>
  )
}
export default FeaturePreferredLanguageCard
