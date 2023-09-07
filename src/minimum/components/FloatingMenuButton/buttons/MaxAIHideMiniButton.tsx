import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { getAppMinimizeContainerElement, showChatBox } from '@/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Stack from '@mui/material/Stack'
import { ROOT_MINIMIZE_CONTAINER_ID } from '@/constants'

const MaxAISettingsMiniButton = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        width: 32,
        height: 32,
        borderRadius: '50%',
      }}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <TextOnlyTooltip
        arrow
        minimumTooltip
        title={t('client:floating_menu__button__hide_menu__until_next_visit')}
        placement={'left'}
      >
        <Button
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            minWidth: 'unset',
            display: 'flex',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={(event) => {
            document.getElementById(ROOT_MINIMIZE_CONTAINER_ID)?.remove()
          }}
        >
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
              color: 'inherit',
            }}
            icon={'Close'}
          />
        </Button>
      </TextOnlyTooltip>
    </Stack>
  )
}
export default MaxAISettingsMiniButton
