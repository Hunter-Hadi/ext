import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { chromeExtensionClientOpenPage } from '@/utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Stack from '@mui/material/Stack'

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
        title={t('common:settings')}
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
            chromeExtensionClientOpenPage({
              key: 'options',
              query: '?id=quick-access#/appearance',
            })
          }}
        >
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
              color: 'inherit',
            }}
            icon={'Settings'}
          />
        </Button>
      </TextOnlyTooltip>
    </Stack>
  )
}
export default MaxAISettingsMiniButton
