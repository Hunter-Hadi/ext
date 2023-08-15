import React, { FC, useEffect, useState } from 'react'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuRootElement,
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
  useChromeExtensionButtonSettingsWithSystemContextMenu,
} from '@/background/utils/buttonSettings'
import Box from '@mui/material/Box'
import PopperWrapper from '@/components/PopperWrapper'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import HowToFindSettings from '@/pages/settings/components/HowToFindSettings'
import {
  ContextMenuSettingsState,
  FloatingDropdownMenuState,
  useRangy,
} from '@/features/contextMenu'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { FloatingContextMenuTemporaryIconButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuTemporaryIconButton'
import { TooltipProps } from '@mui/material/Tooltip'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import { useTranslation } from 'react-i18next'

const FloatingContextMenuMiniMenuMoreButton: FC<{
  placement?: TooltipProps['placement']
  sx?: SxProps
}> = (props) => {
  const { sx, placement } = props
  const { t } = useTranslation(['common', 'client'])
  const [loading, setLoading] = useState(true)
  const setContextMenuSettings = useSetRecoilState(ContextMenuSettingsState)
  const { updateButtonSettingsWithDomain, toggleButtonSettings } =
    useChromeExtensionButtonSettings()
  const textSelectPopupButtonSettings =
    useChromeExtensionButtonSettingsWithSystemContextMenu(
      'textSelectPopupButton',
    )
  console.log(textSelectPopupButtonSettings, 'textSelectPopupButtonSettings')
  const { hideRangy } = useRangy()
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  const [hover, setHover] = useState(false)
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
                zIndex: 2,
                alignSelf: 'end',
                position: 'relative',
                display: 'flex',
                bgcolor: hover ? 'background.paper' : 'transparent',
                borderRadius: hover ? 0 : '0 14px 14px 0',
                transition: hover
                  ? 'background-color 0s ease-out'
                  : 'background-color 0.1s ease-in-out',
                width: '34px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  height: '28px',
                  bgcolor: 'background.paper',
                  width: '21px',
                },
              }}
            >
              <Button
                onMouseEnter={() => {
                  setHover(true)
                }}
                onMouseLeave={() => {
                  setHover(false)
                }}
                size={'small'}
                variant={'text'}
                sx={{
                  padding: '5px 8px',
                  color: 'inherit',
                  minWidth: 'unset',
                  ...sx,
                }}
              >
                <ContextMenuIcon
                  icon={'More'}
                  sx={{
                    color: (t: any) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255,255,255,.87)'
                        : 'rgba(0,0,0,.6)',
                    fontSize: '18px',
                  }}
                />
              </Button>
              <FloatingContextMenuTemporaryIconButton
                ButtonProps={{
                  onMouseEnter: () => {
                    setHover(true)
                  },
                  onMouseLeave: () => {
                    setHover(false)
                  },
                }}
                icon={hover ? 'Close' : 'More'}
                iconSize={18}
                sx={{
                  zIndex: 1,
                  left: hover ? '100%' : 0,
                  transition: 'left 0.1s ease-in-out',
                  width: '34px',
                  height: '28px',
                  padding: '5px 8px',
                  borderRadius: '0 14px 14px 0',
                  right: '-100%',
                  position: 'absolute',
                  bgcolor: 'background.paper',
                  color: (t: any) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                  '&:hover': {
                    bgcolor: (t: any) =>
                      t.palette.mode === 'dark'
                        ? 'rgb(61,61,61)'
                        : 'rgb(224,224,224)',
                  },
                }}
                placement={placement}
              />
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
          <DropdownMenu
            defaultPlacement={'right-start'}
            defaultFallbackPlacements={['right', 'left', 'bottom', 'top']}
            root={root}
            referenceElement={
              <LiteDropdownMenuItem
                isGroup
                icon={'VisibilityOff'}
                label={t('client:floating_menu__button__hide_menu')}
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
              label={t(
                'client:floating_menu__button__hide_menu__until_next_visit',
              )}
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
                          textAlign={'center'}
                          fontWeight={'600'}
                          fontSize={'16px'}
                          color={'text.primary'}
                        >
                          {t(
                            'client:floating_menu__button__hide_menu__this_site__tooltip__title',
                          )}
                        </Typography>
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
                          {t(
                            'client:floating_menu__button__hide_menu__this_site__tooltip__confirm',
                          )}
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
                          {t('common:cancel')}
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
                      {t('client:floating_menu__button__hide_menu__this_site')}
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
                          textAlign={'center'}
                          fontWeight={'600'}
                        >
                          {t(
                            'client:floating_menu__button__hide_menu__all_sites__tooltip__title',
                          )}
                        </Typography>
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
                          {t(
                            'client:floating_menu__button__hide_menu__all_sites__tooltip__confirm',
                          )}
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
                          {t('common:cancel')}
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
                      {t('client:floating_menu__button__hide_menu__all_sites')}
                    </Typography>
                  </Stack>
                </PopperWrapper>
              }
            />
            <LiteDropdownMenuItem
              label={t('client:floating_menu__button__menu_settings')}
              icon={'Settings'}
              onClick={() => {
                chromeExtensionClientOpenPage({
                  key: 'options',
                  query: '#/mini-menu',
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
            label={t('common:settings')}
            icon={'Settings'}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}
export { FloatingContextMenuMiniMenuMoreButton }
