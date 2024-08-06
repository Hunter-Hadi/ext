import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { UseChatGptIcon } from '@/components/CustomIcon'
import CloseMenu from '@/features/contextMenu/components/FloatingImageMiniMenu/CloseMenu'
import useFloatingImageMiniMenu, {
  FloatingImageMiniMenuStaticData,
  useShowFloatingImageMinMenu,
} from '@/features/contextMenu/hooks/useFloatingImageMiniMenu'
import { FloatingImageMiniMenuState } from '@/features/contextMenu/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const MenuList = () => {
  const { t } = useTranslation(['client'])

  return (
    <List
      className='max-ai__menu_transition'
      sx={{
        marginTop: '10px',
        padding: '4px!important',
        bgcolor: (t) => t.palette.background.paper,
        boxShadow: (t) =>
          t.palette.mode === 'dark'
            ? '0 0 4px rgba(255,255,255,0.2)'
            : '0 0 4px rgba(0,0,0,0.2)',
        borderRadius: '6px',

        transform: 'scale(0)',
        transformOrigin: 'left top',
        transition: 'transform 0.2s',
      }}
    >
      <ListItem
        sx={{
          padding: '0px 4px!important',
        }}
        // onClick={() => handleChatWithImage()}
      >
        <ListItemButton
          sx={{
            padding: '0px 8px!important',
            borderRadius: '4px',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: '28px',
            }}
          >
            <QuestionAnswerIcon
              sx={{ fontSize: '16px', color: (t) => t.palette.primary.main }}
            />
          </ListItemIcon>
          <ListItemText
            primary={t(
              'client:floating_menu__mini_menu__image__menu_item__chat_with_image',
            )}
            sx={{
              whiteSpace: 'nowrap',
              '& .use-chat-gpt-ai--MuiTypography-root': {
                fontSize: '14px',
                color: (t) => (t.palette.mode === 'dark' ? '#fff' : '#000'),
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    </List>
  )
}

const CustomText = React.forwardRef(function CustomTextComponent(
  {
    sx,
    className,
  }: {
    sx?: SxProps<Theme>
    className?: string
  },
  ref,
) {
  const { t } = useTranslation(['client'])
  return (
    <Box
      sx={{
        width: '0px',
        overflow: 'hidden',
        transition: 'width 0.2s',
        marginLeft: '0px!important',
        ...(sx || {}),
      }}
      ref={ref}
      className={className}
    >
      <Box
        sx={{
          height: '100%',
          paddingLeft: '8px',
          fontSize: '12px',
          color: '#fff',
          lineHeight: '16px',
          overflow: 'hidden',
          marginLeft: '0px!important',
          whiteSpace: 'nowrap',
        }}
      >
        {t(
          'client:floating_menu__mini_menu__image__menu_item__chat_with_image',
        )}
      </Box>
    </Box>
  )
})

const FloatingImageMiniMenu = () => {
  const tempRef = useRef<HTMLDivElement>(null)
  const [textRealWidth, setTextRealWidth] = useState('0px')
  const menuState = useRecoilValue(FloatingImageMiniMenuState)
  const { showMenu, hideMenu } = useShowFloatingImageMinMenu()
  const { updateSidebarConversationType } = useSidebarSettings()
  const timerHide = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { host } = useFloatingImageMiniMenu()
  useEffect(() => {
    if (menuState.show) {
      // 获取元素实际渲染宽度
      tempRef.current &&
        setTextRealWidth(tempRef.current.offsetWidth + 1 + 'px')
      // console.log('当前宽度：', tempRef.current?.offsetWidth)
    }
  }, [menuState.show])

  const handleMouseenterMenu = () => {
    timerHide.current && clearTimeout(timerHide.current)
    FloatingImageMiniMenuStaticData.mouseInMenu = true
    showMenu()
  }
  const handleMouseleaveMenu = () => {
    FloatingImageMiniMenuStaticData.mouseInMenu = false
    timerHide.current = setTimeout(() => {
      if (!FloatingImageMiniMenuStaticData.mouseInImage) {
        hideMenu()
      }
    }, 50)
  }

  const canChatWithImageResolve = useRef(
    new Promise((resolve) => {
      OneShotCommunicator.receive('CanUseChatWithImage', resolve)
    }),
  )

  // 点击 Chat with Image
  const handleChatWithImage = async () => {
    hideMenu()

    console.log('显示chat')
    if (!isShowChatBox()) {
      showChatBox()
    }
    updateSidebarConversationType('Chat')
    await canChatWithImageResolve.current

    OneShotCommunicator.send('QuickChatWithImage', {
      img: FloatingImageMiniMenuStaticData.currentHoverImage,
    })
      .then()
      .catch()
  }
  return (
    <Stack
      id='MAX_AI_FLOATING_IMAGE_MINI_MENU'
      onMouseEnter={() => handleMouseenterMenu()}
      onMouseLeave={() => handleMouseleaveMenu()}
      onClick={() => handleChatWithImage()}
      alignItems={'center'}
      justifyContent={'center'}
      sx={{
        zIndex: 2147483648,
        padding: '5px', // 增大hover范围
        display: menuState.show ? 'flex' : 'none',
        position: 'fixed',
        top: `calc(${menuState.position.top} + 5px)`,
        left: `calc(${menuState.position.left} + 5px)`,
        // border: '1px solid #f00',
        '&:hover': {
          cursor: 'pointer',
          '.max-ai__custom_text': {
            width: textRealWidth,
          },
          '.max-ai__menu_list': {
            height: 'auto',
            '.max-ai__menu_transition': {
              transform: 'scale(1)',
            },
          },
          '.max-ai__image_mini_menu__close_btn': {
            display: 'flex',
          },
        },
      }}
    >
      <Stack
        direction='row'
        sx={{
          position: 'relative',
          alignItems: 'center',
          zIndex: 2147483648,
          padding: '4px',
          borderRadius: '6px',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          // boxShadow: '0 0 4px rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <UseChatGptIcon
          sx={{
            fontSize: '16px',

            color: '#fff',
          }}
        />
        <CustomText className='max-ai__custom_text' />
        {/* 多渲染一个用于计算未收起时的宽度 */}
        <CustomText
          ref={tempRef}
          sx={{
            width: 'auto',
            color: 'red',
            position: 'fixed',
            left: '-2000px',
            top: '-2000px',

            opacity: 0,
          }}
        />

        <Box
          className='max-ai__menu_list'
          sx={{
            height: '0',
            marginLeft: '0px!important',
            color: '#fff',
            position: 'absolute',
            top: 'calc(100% - 5px)', // 冗余一些距离，避免 hover 到间隙导致抖动
            left: '0px',
          }}
        >
          {/* <MenuList></MenuList> */}
        </Box>

        <CloseMenu
          className={'max-ai__image_mini_menu__close_btn'}
          currentHost={host.current}
        ></CloseMenu>
      </Stack>
    </Stack>
  )
}

export { FloatingImageMiniMenu }
