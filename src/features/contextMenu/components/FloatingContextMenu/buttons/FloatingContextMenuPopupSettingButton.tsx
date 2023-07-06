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
import { useRecoilState } from 'recoil'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  useChromeExtensionButtonSettings,
  useComputedChromeExtensionButtonSettings,
} from '@/background/utils/buttonSettings'
import uniq from 'lodash-es/uniq'
import { AppSettingsState } from '@/store'
import Box from '@mui/material/Box'

const FloatingContextMenuPopupSettingButton: FC<{
  sx?: SxProps
  useInButton?: boolean
}> = (props) => {
  const { sx, useInButton = false } = props
  const [loading, setLoading] = useState(true)
  const { updateButtonSettings, buttonSettings } =
    useChromeExtensionButtonSettings()
  const textSelectPopupButtonSettings =
    useComputedChromeExtensionButtonSettings('textSelectPopupButton')
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  const [appSetting] = useRecoilState(AppSettingsState)
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
            width: useInButton ? 160 : 240,
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
                onClick={(e) => {
                  chromeExtensionClientOpenPage({
                    key: 'options',
                  })
                }}
              >
                <ContextMenuIcon
                  icon={'Settings'}
                  sx={{ color: 'text.primary', fontSize: 16 }}
                />
              </Button>
            </Box>
          }
        >
          {!useInButton && (
            <LiteDropdownMenuItem
              onClick={() => {
                chromeExtensionClientOpenPage({
                  key: 'options',
                  query: '#your-own-prompts',
                })
              }}
              label={'Manage your own prompts'}
              icon={'DefaultIcon'}
            />
          )}
          {useInButton && appSetting.userSettings?.selectionButtonVisible && (
            <LiteDropdownMenuItem
              onClick={async () => {
                if (textSelectPopupButtonSettings) {
                  if (textSelectPopupButtonSettings?.buttonVisible) {
                    // 需要隐藏
                    if (buttonSettings?.textSelectPopupButton.visibility) {
                      const { isWhitelistMode, whitelist, blacklist } =
                        buttonSettings.textSelectPopupButton.visibility
                      if (isWhitelistMode) {
                        await updateButtonSettings('textSelectPopupButton', {
                          visibility: {
                            ...buttonSettings.textSelectPopupButton.visibility,
                            whitelist: whitelist.filter(
                              (item) =>
                                item !== textSelectPopupButtonSettings.host,
                            ),
                          },
                          contextMenu:
                            buttonSettings.textSelectPopupButton.contextMenu,
                        })
                      } else {
                        await updateButtonSettings('textSelectPopupButton', {
                          visibility: {
                            ...buttonSettings.textSelectPopupButton.visibility,
                            blacklist: uniq(
                              blacklist.concat([
                                textSelectPopupButtonSettings.host,
                              ]),
                            ),
                          },
                          contextMenu:
                            buttonSettings.textSelectPopupButton.contextMenu,
                        })
                      }
                    }
                  } else {
                    // 需要显示
                    if (buttonSettings?.textSelectPopupButton.visibility) {
                      const { isWhitelistMode, whitelist, blacklist } =
                        buttonSettings.textSelectPopupButton.visibility
                      if (isWhitelistMode) {
                        await updateButtonSettings('textSelectPopupButton', {
                          visibility: {
                            ...buttonSettings.textSelectPopupButton.visibility,
                            whitelist: uniq(
                              whitelist.concat([
                                textSelectPopupButtonSettings.host,
                              ]),
                            ),
                          },
                          contextMenu:
                            buttonSettings.textSelectPopupButton.contextMenu,
                        })
                      } else {
                        await updateButtonSettings('textSelectPopupButton', {
                          visibility: {
                            ...buttonSettings.textSelectPopupButton.visibility,
                            blacklist: blacklist.filter(
                              (item) =>
                                item !== textSelectPopupButtonSettings.host,
                            ),
                          },
                          contextMenu:
                            buttonSettings.textSelectPopupButton.contextMenu,
                        })
                      }
                    }
                  }
                  setFloatingDropdownMenu({
                    open: false,
                    rootRect: null,
                  })
                }
              }}
              icon={
                textSelectPopupButtonSettings?.buttonVisible
                  ? 'VisibilityOff'
                  : 'RemoveRedEye'
              }
              label={
                textSelectPopupButtonSettings?.buttonVisible
                  ? useInButton
                    ? 'Hide on this site'
                    : 'Hide text-select-popup on this site'
                  : useInButton
                  ? 'Show on this site'
                  : 'Show text-select-popup on this site'
              }
            />
          )}
          {useInButton && (
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
              icon={'DefaultIcon'}
              label={'Manage visibility'}
            />
          )}
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuPopupSettingButton }
