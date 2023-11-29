import React, { FC, useMemo } from 'react'
import CustomTablePagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/CustomTablePagination'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { useTranslation } from 'react-i18next'

const PromptLibraryPagination: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const {
    activeTab,
    promptLibraryListParameters,
    updatePromptLibraryListParameters,
  } = usePromptLibraryParameters()
  const paginationProps = useMemo(
    () => ({
      labelRowsPerPage: t(
        'prompt_library:pagination__label_rows_per_page__title',
      ),
      rowsPerPageOptions: [8, 12, 16, 20],
    }),
    [t],
  )
  if (activeTab !== 'Public') {
    return null
  }
  return (
    <CustomTablePagination
      total={promptLibraryListParameters.total}
      current={promptLibraryListParameters.page}
      pageSize={promptLibraryListParameters.page_size}
      sx={{ justifyContent: 'flex-end', pt: 0, px: 0 }}
      paginationProps={paginationProps}
      onChange={(event, value) => {
        updatePromptLibraryListParameters({
          page: value,
        })
      }}
      onPageSizeChange={(value) => {
        updatePromptLibraryListParameters({
          page_size: value,
        })
      }}
    />
  )
}
export default PromptLibraryPagination
