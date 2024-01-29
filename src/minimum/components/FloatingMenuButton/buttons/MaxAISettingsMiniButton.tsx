import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import MaxAIHideMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIHideMiniButton'
import { chromeExtensionClientOpenPage } from '@/utils'

const MaxAISettingsMiniButton = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Tooltip
      title={<MaxAIHideMiniButton key={'MaxAIHideMiniButton'} />}
      PopperProps={{
        placement: 'bottom',
        disablePortal: true,
        sx: {
          '& > div': {
            mt: '8px!important',
            padding: '0!important',
            bgcolor: 'unset!important',
          },
        },
      }}
    >
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
              boxShadow:
                '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
              color: 'primary.main',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={(event) => {
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '?id=quick-access#/me',
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
    </Tooltip>
  )
}
export default MaxAISettingsMiniButton
