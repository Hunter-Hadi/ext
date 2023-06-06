import React, { FC, useEffect, useState } from 'react'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuElement,
} from '@/utils'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { useRecoilState, useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'

const FloatingContextMenuCloseIconButton: FC<{
  sx?: SxProps
  useInButton?: boolean
}> = (props) => {
  const { sx, useInButton = false } = props
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
          defaultPlacement={'bottom-start'}
          defaultFallbackPlacements={['top-start']}
          hoverOpen
          zIndex={2147483651}
          label={''}
          root={root}
          menuSx={{
            width: useInButton ? 240 : 360,
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
                ? useInButton
                  ? 'Hide on all sites indefinitely'
                  : 'Hide text-select-popup on all sites indefinitely'
                : useInButton
                ? 'Show on all sites indefinitely'
                : 'Show text-select-popup on all sites indefinitely'
            }
          />
          <LiteDropdownMenuItem
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '#custom-prompts',
              })
            }}
            label={'Edit custom prompts'}
            icon={'DefaultIcon'}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuCloseIconButton }
