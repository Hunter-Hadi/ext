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

import { UseChatGptIcon } from '@/components/CustomIcon'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

import { showChatBox } from '../sidebar/utils/sidebarChatBoxHelper'

const MenuList = () => {
  const { t } = useTranslation(['client'])

  // 点击 Chat with Image
  async function handleChatWithImage() {
    showChatBox()
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (window.canChatWithImage) {
        break
      }
    }

    OneShotCommunicator.send('QuickChatWithImage', {
      img: window.ImageMiniMenuAppInstance?.currentHoverImage,
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
            primary={t('client:image_mini_menu__menu_item__chat_with_image')}
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
        }}
      >
        {t('client:image_mini_menu__title')}
      </Box>
    </Box>
  )
})

const ImageMiniMenu = () => {
  const tempRef = useRef<HTMLDivElement>(null)
  const [textRealWidth, setTextRealWidth] = useState('0px')
  useEffect(() => {
    // 获取元素实际渲染宽度
    setTextRealWidth(tempRef.current!.offsetWidth + 1 + 'px')
  }, [tempRef])

  return (
    <Stack
      direction='row'
      spacing={2}
      sx={{
        p: 1,
        position: 'fixed',
        top: 'calc(var(--chat-with-image-bottom) + 10px)',
        left: 'calc(var(--chat-with-image-left) + 10px)',
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
          position: 'fixed',
          left: '-200px',
          top: '-200px',
          color: 'red',
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

export { ImageMiniMenu }
