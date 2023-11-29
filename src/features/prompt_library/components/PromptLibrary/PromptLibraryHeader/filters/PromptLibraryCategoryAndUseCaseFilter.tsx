import React, { FC, useMemo } from 'react'
import { BaseSelect } from '@/components/select'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

import usePromptLibraryCategory from '@/features/prompt_library/hooks/usePromptLibraryCategory'
import Stack from '@mui/material/Stack'
import { inputBaseClasses } from '@mui/material/InputBase'
import useCurrentBreakpoint from '@/features/sidebar/hooks/useCurrentBreakpoint'
import { SxProps } from '@mui/material/styles'
import { formControlClasses } from '@mui/material/FormControl'
import { useTranslation } from 'react-i18next'

const PromptLibraryCategoryAndUseCaseFilter: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const {
    promptLibraryListParameters,
    updatePromptLibraryListParameters,
  } = usePromptLibraryParameters()
  const { categoryOptions, useCaseOptions, loading } = usePromptLibraryCategory(
    promptLibraryListParameters.category,
  )
  const currentBreakpoint = useCurrentBreakpoint()
  const memoSx = useMemo(() => {
    const computedSx: SxProps = {
      width:
        currentBreakpoint === 'xs' ||
        currentBreakpoint === 'sm' ||
        currentBreakpoint === 'md'
          ? '100%'
          : 'unset',
      [`& .${formControlClasses.root}`]: {
        width:
          currentBreakpoint === 'xs'
            ? '100%'
            : currentBreakpoint === 'sm' || currentBreakpoint === 'md'
            ? 'calc(50% - 8px)'
            : 'unset',
      },
      [`& .${inputBaseClasses.root}`]: {
        width:
          currentBreakpoint === 'xs' ||
          currentBreakpoint === 'sm' ||
          currentBreakpoint === 'md'
            ? '100%'
            : '220px',
      },
    }

    return computedSx
  }, [currentBreakpoint])
  return (
    <Stack
      direction={'row'}
      flexWrap={'wrap'}
      alignItems={'center'}
      gap={2}
      sx={memoSx}
    >
      <BaseSelect
        loading={loading}
        sx={{ height: 44 }}
        label={t('prompt_library:filters__category__label')}
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
        label={t('prompt_library:filters__use_case__label')}
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
    </Stack>
  )
}
export default PromptLibraryCategoryAndUseCaseFilter
