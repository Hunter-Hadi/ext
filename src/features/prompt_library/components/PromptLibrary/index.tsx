import { formLabelClasses } from '@mui/material/FormLabel'
import { inputBaseClasses } from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { svgIconClasses } from '@mui/material/SvgIcon'
import React, { FC } from 'react'

import { MAXAI_PROMPT_LIBRARY_ROOT_ID } from '@/features/common/constants'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import PromptLibraryList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList'
import PromptLibraryListProgress from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/PromptLibraryListProgress'
import PromptLibraryCardEditForm from '@/features/prompt_library/extension_components/PromptLibraryCardEditForm'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
import {
  PromptLibraryRuntimeContext,
  PromptLibraryRuntimeType,
} from '@/features/prompt_library/store'

export interface IPromptLibraryAppProps {
  closeOnSelect?: boolean
  runtime: PromptLibraryRuntimeType
  sx?: SxProps
}

const PromptLibrary: FC<IPromptLibraryAppProps> = (props) => {
  const { closeOnSelect = true, runtime, sx } = props
  const { closePromptLibrary } = usePromptLibrary()
  return (
    <PromptLibraryRuntimeContext.Provider
      value={{ promptLibraryRuntime: runtime }}
    >
      <Stack
        id={MAXAI_PROMPT_LIBRARY_ROOT_ID}
        height={'100%'}
        position={'relative'}
        gap={2}
        sx={{
          [`.${formLabelClasses.root}`]: {
            fontSize: '16px',
          },
          [`.${inputBaseClasses.root}`]: {
            [`.${svgIconClasses.root}`]: {
              fontSize: '24px',
            },
          },
          ...sx,
        }}
      >
        {runtime !== 'WebPage' && (
          <PromptLibraryListProgress
            sx={{
              width: 'calc(100% + 32px)',
              left: -16,
              top: -16,
            }}
          />
        )}
        <PromptLibraryHeader />
        <PromptLibraryList
          onClick={(promptLibraryCard) => {
            if (promptLibraryCard && closeOnSelect) {
              closePromptLibrary()
            }
          }}
        />
      </Stack>
      <PromptLibraryCardEditForm />
    </PromptLibraryRuntimeContext.Provider>
  )
}

export default PromptLibrary
