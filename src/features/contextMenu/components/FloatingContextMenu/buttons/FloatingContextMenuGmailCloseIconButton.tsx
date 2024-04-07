import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import {
  chromeExtensionClientOpenPage,
  getMaxAIFloatingContextMenuRootElement,
} from '@/utils'

const FloatingContextMenuGmailCloseIconButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['common', 'client'])
  const [loading, setLoading] = useState(true)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  useEffect(() => {
    if (root) {
      return
    }
    const rootEl = getMaxAIFloatingContextMenuRootElement()
    if (rootEl) {
      setRoot(rootEl)
    }
    setLoading(false)
  }, [])
  return (
    <AppLoadingLayout loading={loading}>
      {root && (
        <DropdownMenu
          defaultPlacement={'bottom-start'}
          defaultFallbackPlacements={['top-start']}
          hoverOpen
          zIndex={2147483610}
          label={''}
          root={root}
          menuSx={{
            width: 240,
          }}
          referenceElement={
            <Button
              size={'small'}
              variant={'text'}
              sx={{
                width: 32,
                height: 32,
                color: 'inherit',
                minWidth: 'unset',
                ...sx,
              }}
            >
              <ContextMenuIcon
                icon={'Settings'}
                sx={{ color: 'rgba(0,0,0,.87)!important', fontSize: 16 }}
              />
            </Button>
          }
        >
          <LiteDropdownMenuItem
            onClick={async () => {
              await chromeExtensionClientOpenPage({
                key: 'options',
                query: '?id=gmail-assistant#/help-me-write',
              })
            }}
            icon={'VisibilityOff'}
            label={t(
              'client:gmail__cta_button__dropdown__hide_gmail_assistant',
            )}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuGmailCloseIconButton }
