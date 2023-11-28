import React, { FC } from 'react'
import { BaseSelect } from '@/components/select'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

import usePromptLibraryCategory from '@/features/prompt_library/hooks/usePromptLibraryCategory'

const PromptLibraryCategoryAndUseCaseFilter: FC = () => {
  const {
    promptLibraryListParameters,
    updatePromptLibraryListParameters,
  } = usePromptLibraryParameters()
  const { categoryOptions, useCaseOptions, loading } = usePromptLibraryCategory(
    promptLibraryListParameters.category,
  )

  return (
    <>
      <BaseSelect
        loading={loading}
        sx={{ height: 44 }}
        label={'Category'}
        options={categoryOptions}
        value={promptLibraryListParameters.category}
        MenuProps={{
          sx: {
            maxHeight: '550px',
          },
        }}
        onChange={async (value: any, option: any) => {
          updatePromptLibraryListParameters({
            category: value as string,
            use_case: 'All',
            page: 0,
          })
        }}
      />
      <BaseSelect
        loading={loading}
        sx={{ height: 44 }}
        label={'Use case'}
        options={useCaseOptions}
        value={promptLibraryListParameters.use_case}
        MenuProps={{
          sx: {
            maxHeight: '550px',
          },
        }}
        onChange={async (value, option) => {
          updatePromptLibraryListParameters({
            use_case: value as string,
            page: 0,
          })
        }}
      />
    </>
  )
}
export default PromptLibraryCategoryAndUseCaseFilter
