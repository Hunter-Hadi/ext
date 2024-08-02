import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { FloatingImageMiniMenuStaticData } from '@/features/contextMenu/hooks/useFloatingImageMiniMenu'
import { FloatingImageMiniMenuState } from '@/features/contextMenu/store'

const CloseMenu = ({ className }: { className?: string }) => {
  const { t } = useTranslation(['client'])
  const setMenu = useSetRecoilState(FloatingImageMiniMenuState)

  const handleHideUntilNextVisit = () => {
    console.log('handleHideUntilNextVisit')
    FloatingImageMiniMenuStaticData.disable = true
    setMenu((prevState) => {
      return {
        ...prevState,
        show: false,
      }
    })
  }

  // const handleHideOnThisSite = () => {
  //     console.log('handleHideOnThisSite')
  // }

  // const handleHideAways = () => {
  //     console.log('handleHideAlways')
  // }

  const menuData = [
    {
      label: t(
        'client:floating_menu__mini_menu__image__close_item__hide_until_next_visit',
      ),
      onClick: () => handleHideUntilNextVisit(),
    },
    // {
    //     label: t('client:floating_menu__mini_menu__image__close_item__hide_on_this_site'),
    //     onClick: () => handleHideOnThisSite(),
    // },
    // {
    //     label: t('client:floating_menu__mini_menu__image__close_item__hide_always'),
    //     onClick: () => handleHideAways(),
    // },
  ]

  return (
    <Box
      className={className}
      onClick={() => handleHideUntilNextVisit()}
      sx={{
        position: 'absolute',
        right: '-5px',
        top: '-5px',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        // display: "flex",
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? '#484848' : '#fff',
        color: (t) => (t.palette.mode === 'dark' ? '#fff' : '#484848'),
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
          fontSize: '14px',
          color: 'inherit',
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

            transform: 'scale(0)',
            transformOrigin: 'left top',
            transition: 'transform 0.2s',
          }}
        >
          {menuData.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                padding: '0px 4px!important',
              }}
              onClick={() => item.onClick()}
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
        </List>
      </Box>
    </Box>
  )
}

export default CloseMenu
