import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import PromptLibraryCategoryAndUseCaseFilter from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibraryCategoryAndUseCaseFilter'
import PromptLibrarySearch from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/filters/PromptLibrarySearch'
import PromptLibraryPagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PrompLibraryPagination'
import PromptLibraryTabs from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader/PromptLibraryTabs'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

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
