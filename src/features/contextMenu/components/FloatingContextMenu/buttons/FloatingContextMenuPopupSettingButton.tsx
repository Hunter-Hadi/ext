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
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Box from '@mui/material/Box'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'

const FloatingContextMenuPopupSettingButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const [loading, setLoading] = useState(true)
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
          zIndex={2147483610}
          label={''}
          root={root}
          menuSx={{
            width: 240,
          }}
          referenceElement={
            <Box
              sx={{
                alignSelf: 'end',
              }}
            >
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
                  icon={'More'}
                  sx={{ color: 'text.primary', fontSize: 16 }}
                />
              </Button>
            </Box>
          }
        >
          <LiteDropdownMenuItem
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '#my-own-prompts',
              })
            }}
            label={'Manage my own prompts'}
            icon={'DefaultIcon'}
          />
          <DropdownMenu
            defaultPlacement={'right-start'}
            defaultFallbackPlacements={['right', 'left', 'bottom', 'top']}
            root={root}
            referenceElement={
              <LiteDropdownMenuItem
                isGroup
                icon={'Delete'}
                label={'Clear suggested'}
              />
            }
            menuSx={{
              width: 320,
            }}
            hoverOpen
            zIndex={2147483611}
            label={''}
          >
            <LiteDropdownMenuItem
              label={'Clear suggested prompts for this site'}
              onClick={async () => {
                await FavoriteMediatorFactory.getMediator(
                  'textSelectPopupButton',
                ).clearCache()
              }}
            ></LiteDropdownMenuItem>
            <LiteDropdownMenuItem
              label={'Clear suggested prompts for all sites'}
              onClick={async () => {
                await FavoriteMediatorFactory.getMediator(
                  'textSelectPopupButton',
                ).clearAllHostCache()
              }}
            ></LiteDropdownMenuItem>
          </DropdownMenu>
          <LiteDropdownMenuItem
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
              })
            }}
            label={'Settings'}
            icon={'Settings'}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuPopupSettingButton }
