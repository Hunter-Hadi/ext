import { Stack } from '@mui/material'
import React, { FC } from 'react'

import AppLoadingLayout from '@/components/AppLoadingLayout'
import PromptLibraryTabs from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PromptLibraryTabs'
import PromptLibraryCategoryAndUseCaseFilter from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibraryCategoryAndUseCaseFilter'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import PromptLibrarySearch from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibrarySearch'
import PromptLibraryPagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PrompLibraryPagination'

const PromptLibraryHeader: FC = () => {
  const {
    activeTab,
    promptLibraryListParameters,
  } = usePromptLibraryParameters()
  return (
    <Stack width={'100%'} gap={2} position={'sticky'} top={0}>
      <AppLoadingLayout loading={!promptLibraryListParameters.enabled}>
        <PromptLibraryTabs />
        {activeTab === 'Public' && (
          <Stack
            alignItems={'center'}
            direction={'row'}
            gap={2}
            justifyContent={'space-between'}
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
