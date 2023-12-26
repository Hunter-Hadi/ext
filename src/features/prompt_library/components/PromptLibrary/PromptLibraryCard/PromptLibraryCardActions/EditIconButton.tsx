import IconButton from '@mui/material/IconButton'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PromptLibraryTooltip from '@/features/prompt_library/components/PromptLibrary/PromptLibraryTooltip'

const EditIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 20 20" sx={props.sx}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.33333 13.8C2.96667 13.8 2.65278 13.6695 2.39167 13.4084C2.13056 13.1473 2 12.8334 2 12.4667V3.13337C2 2.7667 2.13056 2.45281 2.39167 2.1917C2.65278 1.93059 2.96667 1.80003 3.33333 1.80003H9.28333L7.95 3.13337H3.33333V12.4667H12.6667V7.83337L14 6.50003V12.4667C14 12.8334 13.8694 13.1473 13.6083 13.4084C13.3472 13.6695 13.0333 13.8 12.6667 13.8H3.33333ZM10.7833 2.18337L11.7333 3.1167L7.33333 7.5167V8.4667H8.26667L12.6833 4.05003L13.6333 4.98337L8.83333 9.80003H6V6.9667L10.7833 2.18337ZM13.6333 4.98337L10.7833 2.18337L12.45 0.516699C12.7167 0.250033 13.0361 0.116699 13.4083 0.116699C13.7806 0.116699 14.0944 0.250033 14.35 0.516699L15.2833 1.4667C15.5389 1.72225 15.6667 2.03337 15.6667 2.40003C15.6667 2.7667 15.5389 3.07781 15.2833 3.33337L13.6333 4.98337Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  )
}

export const EditIconButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation(['prompt_library'])
  return (
    <PromptLibraryTooltip title={t('prompt_library:edit_prompt__tooltip')}>
      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation()
          onClick && onClick()
        }}
      >
        <EditIcon
          sx={{
            // color: 'rgba(0, 0, 0, 0.54)',
            fontSize: 16,
          }}
        />
      </IconButton>
    </PromptLibraryTooltip>
  )
}
