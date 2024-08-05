import { Divider } from '@mui/material'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  getChromeExtensionDBStorage,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  FloatingImageMiniMenuStaticData,
  useShowFloatingImageMinMenu,
  useUpdateAppSettings,
} from '@/features/contextMenu/hooks/useFloatingImageMiniMenu'
import { chromeExtensionClientOpenPage } from '@/utils'

const CloseMenu = ({
  currentHost,
  className,
}: {
  currentHost: string
  className?: string
}) => {
  const { t } = useTranslation(['client'])
  const { hideMenu } = useShowFloatingImageMinMenu()
  const { updateAppSettings } = useUpdateAppSettings()

  const handleHideUntilNextVisit = (e: React.MouseEvent) => {
    e.stopPropagation()
    FloatingImageMiniMenuStaticData.disable = true
    hideMenu()
  }

  const handleHideOnThisSite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('handleHideOnThisSite')
    const setting = await getChromeExtensionDBStorage()
    await setChromeExtensionDBStorage({
      floatingImageMiniMenu: {
        visibility: {
          ...setting.floatingImageMiniMenu!.visibility,
          blacklist: [
            ...setting.floatingImageMiniMenu!.visibility.blacklist,
            currentHost,
          ],
        },
      },
    })

    updateAppSettings()
    hideMenu()
  }

  const handleHideAways = async (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('handleHideAlways')
    const setting = await getChromeExtensionDBStorage()
    await setChromeExtensionDBStorage({
      floatingImageMiniMenu: {
        visibility: {
          ...setting.floatingImageMiniMenu!.visibility,
          isWhitelistMode: true,
        },
      },
    })
    updateAppSettings()
    hideMenu()
  }

  const menuData = [
    {
      label: t(
        'client:floating_menu__mini_menu__image__close_item__hide_until_next_visit',
      ),
      onClick: (e: React.MouseEvent) => handleHideUntilNextVisit(e),
    },
    {
      label: t(
        'client:floating_menu__mini_menu__image__close_item__hide_on_this_site',
      ),
      onClick: (e: React.MouseEvent) => handleHideOnThisSite(e),
    },
    {
      label: t(
        'client:floating_menu__mini_menu__image__close_item__hide_always',
      ),
      onClick: (e: React.MouseEvent) => handleHideAways(e),
    },
  ]

  return (
    <Box
      className={className}
      onClick={(event) => handleHideUntilNextVisit(event)}
      sx={{
        position: 'absolute',
        right: '-10px',
        top: '-10px',
        borderRadius: '50%',
        width: '14px',
        height: '14px',
        // display: "flex",
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        '&:hover': {
          cursor: 'pointer',
          '.max_ai__image_mini_menu__close_menu_wrap': {
            height: 'auto',
            '.max_ai__image_mini_menu__close_menu': {
              transform: 'scale(1)',
            },
          },
        },
      }}
    >
      <ContextMenuIcon
        sx={{
          fontSize: '10px',
          color: '#fff',
        }}
        icon={'Close'}
      />
      <Box
        className='max_ai__image_mini_menu__close_menu_wrap'
        sx={{
          // height: '0',
          marginLeft: '0px!important',
          color: '#fff',
          position: 'absolute',
          left: 'calc(100% - 5px)', // 冗余一些距离，避免 hover 到间隙导致抖动
          top: '-10px',
        }}
      >
        <List
          className='max_ai__image_mini_menu__close_menu'
          sx={{
            marginLeft: '10px',
            padding: '4px!important',
            bgcolor: (t) => t.palette.background.paper,
            borderRadius: '6px',
            boxShadow: (t) =>
              t.palette.mode === 'dark'
                ? '0 0 4px rgba(255,255,255,0.2)'
                : '0 0 4px rgba(0,0,0,0.2)',

            transform: 'scale(0)',
            transformOrigin: 'left top',
            transition: 'transform 0.2s',
          }}
        >
          {menuData.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                padding: '0px 2px!important',
              }}
              onClick={(event) => item.onClick(event)}
            >
              <ListItemButton
                sx={{
                  padding: '0px 8px!important',
                  borderRadius: '4px',
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    whiteSpace: 'nowrap',
                    '& .use-chat-gpt-ai--MuiTypography-root': {
                      fontSize: '14px',
                      color: (t) =>
                        t.palette.mode === 'dark' ? '#fff' : '#000',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ margin: '4px 0px' }}></Divider>
          <ListItem
            sx={{
              padding: '0px 2px!important',
            }}
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
                query: '#/appearance',
              })
            }}
          >
            <ListItemButton
              sx={{
                padding: '0px 6px!important',
                borderRadius: '4px',
              }}
            >
              <ListItemText
                primary={
                  <div
                    dangerouslySetInnerHTML={{
                      __html: t(
                        'client:floating_menu__mini_menu__image__close_item__settings_tips',
                      ),
                    }}
                  />
                }
                sx={{
                  whiteSpace: 'nowrap',
                  '& .use-chat-gpt-ai--MuiTypography-root': {
                    fontSize: '13px',
                    color: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.38)'
                        : 'rgba(0,0,0,0.38)',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  )
}

export default CloseMenu
