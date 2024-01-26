import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SearchWithAIMaxSearchResultsSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAIMaxSearchResultsSelector'
import SearchWithAISearchEngineSelector from '@/features/sidebar/components/SidebarChatBox/search_with_ai_components/SearchWithAISearchEngineSelector'

const SearchAdvanced = () => {
  const { t } = useTranslation(['client'])
  return (
    <Stack spacing={1}>
      <Stack direction={'row'} mb={1}>
        <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
          {t('client:sidebar__search_with_ai__advanced__title')}
        </Typography>
      </Stack>
      <Stack spacing={2} width={'100%'}>
        <SearchWithAISearchEngineSelector />
        <SearchWithAIMaxSearchResultsSelector />
      </Stack>
    </Stack>
  )
}

export default SearchAdvanced
