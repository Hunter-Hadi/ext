import Box from '@mui/material/Box'
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
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuRootElement,
} from '@/utils'

const FloatingContextMenuPopupSettingButton: FC<{
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
    const rootEl = getAppContextMenuRootElement()
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
                query: '#/my-own-prompts',
              })
            }}
            label={t('client:floating_menu__button__manage_my_own_prompt')}
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
                label={t('client:floating_menu__button__clear_suggested')}
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
              label={t(
                'client:floating_menu__button__clear_suggested__this_site',
              )}
              onClick={async () => {
                await FavoriteMediatorFactory.getMediator(
                  'textSelectPopupButton',
                ).clearCache()
              }}
            ></LiteDropdownMenuItem>
            <LiteDropdownMenuItem
              label={t(
                'client:floating_menu__button__clear_suggested__all_sites',
              )}
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
            label={t('common:settings')}
            icon={'Settings'}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuPopupSettingButton }
