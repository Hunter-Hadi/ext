import React, { FC } from 'react'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { MagicBookIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'

const PromptLibraryIconButton: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  return (
    <TextOnlyTooltip
      placement={'top'}
      title={t('prompt_library:use_prompt_library__title')}
    >
      <Button
        sx={{
          p: '5px',
          minWidth: 'unset',
        }}
        variant={'outlined'}
      >
        <MagicBookIcon sx={{ fontSize: '20px', color: 'primary.main' }} />
      </Button>
    </TextOnlyTooltip>
  )
}
export default PromptLibraryIconButton
