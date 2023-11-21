import { Stack } from '@mui/material'
import React, { FC } from 'react'

import AppLoadingLayout from '@/components/AppLoadingLayout'
import PromptLibraryTabs from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PromptLibraryTabs'
import PromptLibraryCategoryAndUseCaseFilter from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibraryCategoryAndUseCaseFilter'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import PromptLibrarySearch from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibrarySearch'

const PromptLibraryHeader: FC = () => {
  const { activeTab } = usePromptLibraryParameters()
  return (
    <Stack
      width={'100%'}
      direction={'row'}
      alignItems={'center'}
      flexWrap={'wrap'}
      gap={2}
    >
      <AppLoadingLayout loading={false}>
        <PromptLibraryTabs />
        {activeTab === 'Public' && (
          <>
            <PromptLibraryCategoryAndUseCaseFilter />
            <PromptLibrarySearch />
          </>
        )}
      </AppLoadingLayout>
    </Stack>
  )
}
export default PromptLibraryHeader
