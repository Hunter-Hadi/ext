import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SxProps,
  Theme,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useSetRecoilState } from 'recoil'

import { UseChatGptIcon } from '@/components/CustomIcon'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

import { showChatBox } from '../../../sidebar/utils/sidebarChatBoxHelper'
import useFloatingImageMiniMenu, {
  FloatingImageMiniMenuStaticData,
} from '../../hooks/useFloatingImageMiniMenu'
import { FloatingImageMiniMenuState } from '../../store'

const MenuList = () => {
  const { t } = useTranslation(['client'])

  const setMenu = useSetRecoilState(FloatingImageMiniMenuState)

  const canChatWithImageResolve = useRef(
    new Promise((resolve) => {
      OneShotCommunicator.receive('CanUseChatWithImage', resolve)
    }),
  )

  // 点击 Chat with Image
  const handleChatWithImage = async () => {
    setMenu((prevState) => {
      return {
        ...prevState,
        show: false,
      }
    })

    showChatBox()
    await canChatWithImageResolve.current

    OneShotCommunicator.send('QuickChatWithImage', {
      img: FloatingImageMiniMenuStaticData.currentHoverImage,
    })
      .then()
      .catch()
  }
  return (
    <List
      className='max-ai__menu_transition'
      sx={{
        marginTop: '10px',
        padding: '4px!important',
        bgcolor: '#454545',
        borderRadius: '6px',

        transform: 'scale(0)',
        transformOrigin: 'left',
        transition: 'transform 0.2s',
      }}
    >
      <ListItem
        sx={{
          padding: '0px 4px!important',
        }}
        onClick={() => handleChatWithImage()}
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
            <QuestionAnswerIcon sx={{ fontSize: '16px', color: '#fff' }} />
          </ListItemIcon>
          <ListItemText
            primary={t(
              'client:floating_menu__mini_menu__image__menu_item__chat_with_image',
            )}
            sx={{
              whiteSpace: 'nowrap',
              '& .use-chat-gpt-ai--MuiTypography-root': {
                fontSize: '14px',
                color: '#fff',
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
        height: '16px',
        lineHeight: '16px',
        width: '0px',
        overflow: 'hidden',
        transition: 'width 0.2s',
        marginLeft: '0px!important',
        color: 'rgba(255,255,255,.87)',
        ...(sx || {}),
      }}
      ref={ref}
      className={className}
    >
      <Box
        sx={{
          height: '100%',
          paddingLeft: '8px',
          fontSize: '14px',
          overflow: 'hidden',
          marginLeft: '0px!important',
          whiteSpace: 'nowrap',
        }}
      >
        {t('client:floating_menu__mini_menu__image__title')}
      </Box>
    </Box>
  )
})

const FloatingImageMiniMenu = () => {
  const tempRef = useRef<HTMLDivElement>(null)
  const [textRealWidth, setTextRealWidth] = useState('0px')
  const [menuState, setMenu] = useRecoilState(FloatingImageMiniMenuState)

  const timerHide = useRef<ReturnType<typeof setTimeout> | null>(null)

  useFloatingImageMiniMenu()
  useEffect(() => {
    // 获取元素实际渲染宽度
    tempRef.current && setTextRealWidth(tempRef.current.offsetWidth + 1 + 'px')
  }, [tempRef])

  const handleMouseenterMenu = () => {
    timerHide.current && clearTimeout(timerHide.current)
    FloatingImageMiniMenuStaticData.mouseInMenu = true
    setMenu((prevState) => {
      return {
        ...prevState,
      }
    })
  }
  const handleMouseleaveMenu = () => {
    FloatingImageMiniMenuStaticData.mouseInMenu = false
    timerHide.current = setTimeout(() => {
      setMenu((prevState) => {
        return {
          ...prevState,
          show: FloatingImageMiniMenuStaticData.mouseInImage,
        }
      })
    }, 50)
  }
  return (
    <Stack
      id='MAX_AI_FLOATING_IMAGE_MINI_MENU'
      direction='row'
      spacing={2}
      onMouseEnter={() => handleMouseenterMenu()}
      onMouseLeave={() => handleMouseleaveMenu()}
      sx={{
        display: menuState.show ? 'flex' : 'none',
        p: 1,
        position: 'fixed',
        top: `calc(${menuState.position.top} + 10px)`,
        left: `calc(${menuState.position.left} + 10px)`,
        transform: 'translateY(calc(-100% - 20px))',
        zIndex: 2147483648,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '6px',
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
        },
      }}
    >
      <UseChatGptIcon sx={{ fontSize: '16px', color: '#fff' }} />
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
        <MenuList></MenuList>
      </Box>
    </Stack>
  )
}

export { FloatingImageMiniMenu }
