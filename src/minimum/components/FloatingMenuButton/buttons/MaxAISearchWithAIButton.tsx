import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import { showChatBox } from '@/utils'

const MaxAISummarizeMiniButton = () => {
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
        title={t('client:sidebar__tabs__search__tooltip')}
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
            boxShadow:
              '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={(event) => {
            showChatBox()
            const timer = setInterval(() => {
              if (
                getMaxAISidebarRootElement()?.querySelector(
                  'p[data-testid="max-ai__summary-tab"]',
                )
              ) {
                clearInterval(timer)
                window.dispatchEvent(
                  new CustomEvent('MaxAISwitchSidebarTab', {
                    detail: {
                      type: 'Search' as ISidebarConversationType,
                    },
                  }),
                )
              }
            }, 500)
          }}
        >
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
              color: 'inherit',
            }}
            icon={'Search'}
          />
        </Button>
      </TextOnlyTooltip>
    </Stack>
  )
}
export default MaxAISummarizeMiniButton
