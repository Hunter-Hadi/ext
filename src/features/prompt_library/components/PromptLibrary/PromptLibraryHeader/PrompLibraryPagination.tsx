import React, { FC, useMemo } from 'react'
import CustomTablePagination from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/CustomTablePagination'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

const PromptLibraryPagination: FC = () => {
  const {
    activeTab,
    promptLibraryListParameters,
    updatePromptLibraryListParameters,
  } = usePromptLibraryParameters()
  const paginationProps = useMemo(
    () => ({
      labelRowsPerPage: 'Prompts per page:',
      rowsPerPageOptions: [8, 12, 16, 20],
    }),
    [],
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
