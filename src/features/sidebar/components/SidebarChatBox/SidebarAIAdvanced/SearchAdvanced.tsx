import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import LanguageSelect from '@/components/select/LanguageSelect'
import SearchWithAIMaxSearchResultsSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIMaxSearchResultsSelector'
import SearchWithAISearchEngineSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAISearchEngineSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const SearchAdvanced = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'client'])
  return (
    <Stack spacing={1}>
      <Stack direction={'row'} mb={1}>
        <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
          {t('client:sidebar__search_with_ai__advanced__title')}
        </Typography>
      </Stack>
      <Stack spacing={2} width={'100%'}>
        {userSettings && (
          <LanguageSelect
            sx={{ flexShrink: 0, width: '100%' }}
            boxSx={{ maxWidth: 'unset' }}
            label={t(
              'settings:feature_card__ai_response_language__field_ai_response_language__label',
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
        <SearchWithAISearchEngineSelector />
        <SearchWithAIMaxSearchResultsSelector />
      </Stack>
    </Stack>
  )
}

export default SearchAdvanced
