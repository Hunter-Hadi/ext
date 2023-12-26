import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import IconButton from '@mui/material/IconButton'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PromptLibraryTooltip from '@/features/prompt_library/components/PromptLibrary/PromptLibraryTooltip'

export const SeeIconButton: FC<{ detailLink: string }> = ({ detailLink }) => {
  const { t } = useTranslation(['prompt_library'])
  return (
    <PromptLibraryTooltip title={t('prompt_library:view_details__tooltip')}>
      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation()
          window.open(detailLink)
        }}
      >
        <RemoveRedEyeIcon
          sx={{
            fontSize: 16,
          }}
        />
      </IconButton>
    </PromptLibraryTooltip>
  )
}
