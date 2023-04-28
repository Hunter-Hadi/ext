import React, { FC, useEffect, useState } from 'react'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuElement,
} from '@/utils'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { Button, SxProps } from '@mui/material'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'

const FloatingContextMenuCloseIconButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const [loading, setLoading] = useState(true)
  const appSettings = useRecoilValue(AppSettingsState)
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
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
          defaultPlacement={'bottom-start'}
          defaultFallbackPlacements={['top-start']}
          hoverOpen
          zIndex={2147483651}
          label={''}
          root={root}
          menuSx={{
            width: 320,
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
              <CancelOutlinedIcon
                sx={{ color: 'text.primary', fontSize: 16 }}
              />
            </Button>
          }
        >
          <LiteDropdownMenuItem
            onClick={async () => {
              setFloatingDropdownMenu({
                open: false,
                rootRect: null,
              })
              setContextMenuSettings((prevSettings) => ({
                ...prevSettings,
                closeBeforeRefresh: true,
              }))
            }}
            icon={'Close'}
            label={`Hide text-select-popup until page refresh`}
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
                ? 'Hide text-select-popup on all sites'
                : 'Show text-select-popup on all sites'
            }
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuCloseIconButton }
