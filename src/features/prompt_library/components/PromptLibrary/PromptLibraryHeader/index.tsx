import { Stack } from '@mui/material'
import React, { FC } from 'react'

import AppLoadingLayout from '@/components/AppLoadingLayout'
import PromptLibraryTabs from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PromptLibraryTabs'
import PromptLibraryCategoryAndUseCaseFilter from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibraryCategoryAndUseCaseFilter'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import PromptLibrarySearch from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibrarySearch'
import PromptLibraryPagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PrompLibraryPagination'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

const PromptLibraryHeader: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const {
    activeTab,
    promptLibraryListParameters,
  } = usePromptLibraryParameters()
  return (
    <Stack width={'100%'} gap={2} position={'sticky'} top={0}>
      <AppLoadingLayout loading={!promptLibraryListParameters.enabled}>
        <Typography
          fontSize={'24px'}
          lineHeight={'28px'}
          fontWeight={800}
          color={'text.primary'}
          textAlign={'center'}
        >
          {t('prompt_library:use_prompt_library__title')}
        </Typography>
        <PromptLibraryTabs />
        {activeTab === 'Public' && (
          <Stack
            alignItems={'center'}
            direction={'row'}
            gap={2}
            justifyContent={'space-between'}
            flexWrap={'wrap'}
          >
            <PromptLibraryCategoryAndUseCaseFilter />
            <PromptLibrarySearch />
          </Stack>
        )}
        <PromptLibraryPagination />
      </AppLoadingLayout>
    </Stack>
  )
}
export default PromptLibraryHeader
