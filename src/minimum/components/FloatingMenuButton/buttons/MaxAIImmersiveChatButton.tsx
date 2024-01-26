import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { chromeExtensionClientOpenPage } from '@/utils'

const MaxAIImmersiveChatButton = () => {
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
        title={t('client:sidebar__button__immersive_chat')}
        placement={'left'}
      >
        <Button
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            minWidth: 'unset',
            display: 'flex',
            color: 'primary.main',
            boxShadow:
              '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={() => {
            chromeExtensionClientOpenPage({
              url: Browser.runtime.getURL(`/pages/chat/index.html`),
            })
          }}
        >
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
              color: 'inherit',
            }}
            icon={'Fullscreen'}
          />
        </Button>
      </TextOnlyTooltip>
    </Stack>
  )
}
export default MaxAIImmersiveChatButton
