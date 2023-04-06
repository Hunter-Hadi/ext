import React, { FC, useEffect, useState } from 'react'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuElement,
} from '@/utils'
import AppLoadingLayout from '@/components/LoadingLayout'
import { Button, SxProps } from '@mui/material'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import { useRecoilState, useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'

const FloatingContextMenuMoreIconButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const [loading, setLoading] = useState(true)
  const appSettings = useRecoilValue(AppSettingsState)
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  useEffect(() => {
    if (root) {
      return
    }
    const rootEl = getAppContextMenuElement()
    if (rootEl) {
      setRoot(rootEl)
    }
    setLoading(false)
  }, [])
  return (
    <AppLoadingLayout loading={loading}>
      {root && (
        <DropdownMenu
          hoverOpen
          zIndex={2147483651}
          label={''}
          root={root}
          menuSx={{
            width: 220,
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
                sx={{ color: 'text.primary' }}
                icon={'More'}
                size={16}
              />
            </Button>
          }
        >
          <LiteDropdownMenuItem
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '#edit-menu-options',
              })
            }}
            label={'Edit options'}
            icon={'DefaultIcon'}
          />
          <LiteDropdownMenuItem
            onClick={async () => {
              setFloatingDropdownMenu({
                open: false,
                rootRect: null,
              })
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '#text-select-popup',
              })
            }}
            icon={
              appSettings?.userSettings?.selectionButtonVisible
                ? 'VisibilityOff'
                : 'RemoveRedEye'
            }
            label={
              appSettings?.userSettings?.selectionButtonVisible
                ? 'Hide text select popup'
                : 'Show text select popup'
            }
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuMoreIconButton }
