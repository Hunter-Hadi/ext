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
import {
  useChromeExtensionButtonSettings,
  useComputedChromeExtensionButtonSettings,
} from '@/background/utils/buttonSettings'
import Box from '@mui/material/Box'
import PopperWrapper from '@/components/PopperWrapper'
import { Card } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import HowToFindSettings from '@/pages/options/pages/UseChatGPTOptionsSettingPage/HowToFindSettings'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
  useRangy,
} from '@/features/contextMenu'
import { useRecoilState, useSetRecoilState } from 'recoil'

const FloatingContextMenuMiniMenuMoreButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const [loading, setLoading] = useState(true)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
  const { updateButtonSettingsWithDomain, toggleButtonSettings } =
    useChromeExtensionButtonSettings()
  const textSelectPopupButtonSettings =
    useComputedChromeExtensionButtonSettings('textSelectPopupButton')
  console.log(textSelectPopupButtonSettings, 'textSelectPopupButtonSettings')
  const { hideRangy } = useRangy()
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
          zIndex={2147483610}
          label={''}
          root={root}
          menuSx={{
            width: 160,
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
          <DropdownMenu
            defaultPlacement={'right-start'}
            defaultFallbackPlacements={['right', 'left', 'bottom', 'top']}
            root={root}
            referenceElement={
              <LiteDropdownMenuItem
                isGroup
                icon={'VisibilityOff'}
                label={'Hide menu'}
              />
            }
            menuSx={{
              width: 220,
            }}
            hoverOpen
            zIndex={2147483611}
            label={''}
          >
            <LiteDropdownMenuItem
              onClick={() => {
                setFloatingDropdownMenu({
                  open: false,
                  rootRect: null,
                })
                setContextMenuSettings((prevSettings) => ({
                  ...prevSettings,
                  closeBeforeRefresh: true,
                }))
              }}
              label={'Hide menu until next visit'}
            />
            <LiteDropdownMenuItem
              CustomRenderNode={
                <PopperWrapper
                  PopperProps={{
                    placement: 'top',
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                  }}
                  content={
                    <Card
                      sx={{
                        p: 3,
                        width: 288,
                        boxSizing: 'border-box',
                        cursor: 'auto',
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography
                          fontSize={'16px'}
                          color={'text.primary'}
                        >{`Hide 'Mini menu' for this website?`}</Typography>
                        <HowToFindSettings liteMode />
                        <Box />
                        <Button
                          variant={'outlined'}
                          color={'primary'}
                          onClick={async () => {
                            await updateButtonSettingsWithDomain(
                              'textSelectPopupButton',
                            )
                            setFloatingDropdownMenu({
                              open: false,
                              rootRect: null,
                            })
                          }}
                        >
                          {textSelectPopupButtonSettings?.buttonVisible
                            ? 'Hide menu for this site'
                            : 'Show menu for this site'}
                        </Button>
                        <Button
                          variant={'contained'}
                          color={'primary'}
                          onClick={() => {
                            setFloatingDropdownMenu({
                              open: false,
                              rootRect: null,
                            })
                            hideRangy()
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Card>
                  }
                >
                  <Stack
                    direction={'row'}
                    spacing={1}
                    px={1}
                    alignItems={'center'}
                  >
                    <ContextMenuIcon
                      size={16}
                      icon={'Empty'}
                      sx={{ color: 'primary.main', flexShrink: 0 }}
                    />
                    <Typography
                      fontSize={14}
                      textAlign={'left'}
                      color={'text.primary'}
                      width={0}
                      noWrap
                      flex={1}
                      lineHeight={'28px'}
                    >
                      {textSelectPopupButtonSettings?.buttonVisible
                        ? 'Hide menu for this site'
                        : 'Show menu for this site'}
                    </Typography>
                  </Stack>
                </PopperWrapper>
              }
            />
            <LiteDropdownMenuItem
              CustomRenderNode={
                <PopperWrapper
                  PopperProps={{
                    placement: 'top',
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                  }}
                  content={
                    <Card
                      sx={{
                        p: 3,
                        width: 288,
                        boxSizing: 'border-box',
                        cursor: 'auto',
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography
                          fontSize={'16px'}
                          color={'text.primary'}
                        >{`Always hide 'Mini menu'?`}</Typography>
                        <HowToFindSettings liteMode />
                        <Box />
                        <Button
                          variant={'outlined'}
                          color={'primary'}
                          onClick={async () => {
                            await toggleButtonSettings(
                              'textSelectPopupButton',
                              false,
                            )
                            setFloatingDropdownMenu({
                              open: false,
                              rootRect: null,
                            })
                          }}
                        >
                          {'Hide menu always'}
                        </Button>
                        <Button
                          variant={'contained'}
                          color={'primary'}
                          onClick={() => {
                            setFloatingDropdownMenu({
                              open: false,
                              rootRect: null,
                            })
                            hideRangy()
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Card>
                  }
                >
                  <Stack
                    direction={'row'}
                    spacing={1}
                    px={1}
                    alignItems={'center'}
                  >
                    <ContextMenuIcon
                      size={16}
                      icon={'Empty'}
                      sx={{ color: 'primary.main', flexShrink: 0 }}
                    />
                    <Typography
                      fontSize={14}
                      textAlign={'left'}
                      color={'text.primary'}
                      width={0}
                      noWrap
                      flex={1}
                      lineHeight={'28px'}
                    >
                      {'Hide menu always'}
                    </Typography>
                  </Stack>
                </PopperWrapper>
              }
            />
            <LiteDropdownMenuItem
              label={'Menu settings'}
              icon={'Settings'}
              onClick={() => {
                chromeExtensionClientOpenPage({
                  key: 'options',
                  query: '#mini-menu-on-text-selection',
                })
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
export { FloatingContextMenuMiniMenuMoreButton }
