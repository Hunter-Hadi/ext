import React, { FC } from 'react'
import PromptLibraryHeader from '@/features/prompt_library/components/PromptLibrary/PromptLibraryHeader'
import Stack from '@mui/material/Stack'
import PromptLibraryList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
import PromptLibraryListProgress from '@/features/prompt_library/components/PromptLibrary/PromptLibraryList/PromptLibraryListProgress'
import PromptLibraryCardEditForm from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCardEditForm'
import { inputBaseClasses } from '@mui/material/InputBase'
import { formLabelClasses } from '@mui/material/FormLabel'
import { svgIconClasses } from '@mui/material/SvgIcon'
export interface IPromptLibraryAppProps {
  closeOnSelect?: boolean
}

const PromptLibrary: FC<IPromptLibraryAppProps> = (props) => {
  const { closeOnSelect = true } = props
  const { closePromptLibrary } = usePromptLibrary()
  return (
    <Stack
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
      }}
    >
      <PromptLibraryListProgress
        sx={{
          width: 'calc(100% + 32px)',
          left: -16,
          top: -16,
        }}
      />
      <PromptLibraryHeader />
      <PromptLibraryList
        onClick={(promptLibraryCard) => {
          if (promptLibraryCard && closeOnSelect) {
            closePromptLibrary()
          }
        }}
      />
      <PromptLibraryCardEditForm />
    </Stack>
  )
}

export default PromptLibrary
