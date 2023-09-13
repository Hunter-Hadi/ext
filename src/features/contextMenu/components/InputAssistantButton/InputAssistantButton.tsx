import React, { FC, useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { SxProps } from '@mui/material/styles'
import useEffectOnce from '@/hooks/useEffectOnce'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'

// 按钮位置选项
type InputAssistantButtonPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'right-top'
  | 'right-center'
  | 'right-bottom'

// 按钮尺寸选项
type InputAssistantButtonSize = 'small' | 'medium' | 'large'

// 按钮样式配置
interface InputAssistantButtonStyle {
  backgroundColor?: string // 按钮背景颜色
  hoverBackgroundColor?: string // 按钮鼠标悬浮时背景颜色
  color?: string // 按钮文字颜色
  hoverColor?: string // 按钮鼠标悬浮时文字颜色
  borderColor?: string // 按钮边框颜色
  hoverBorderColor?: string // 按钮鼠标悬浮时边框颜色
  borderRadius?: number // 按钮圆角
  borderWidth?: number // 按钮边框宽度
  iconSize?: number // 按钮文字大小
  margin?: string // 按钮外边距
  padding?: string // 按钮内边距
}

interface InputAssistantButtonProps {
  buttonMode?: 'fixed' | 'static' // 按钮模式
  buttonPosition?: InputAssistantButtonPosition // 按钮位置
  buttonSize?: InputAssistantButtonSize // 按钮尺寸
  CTAButtonStyle?: InputAssistantButtonStyle // 按钮样式
  DropdownButtonStyle?: InputAssistantButtonStyle // 按钮样式
  InputAssistantBoxStyle?: SxProps
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}
const InputAssistantButton: FC<InputAssistantButtonProps> = (props) => {
  const conversation = useRecoilValue(ChatGPTConversationState)
  const {
    onClick,
    InputAssistantBoxStyle,
    DropdownButtonStyle,
    CTAButtonStyle,
  } = props
  const memoButtonSx = useMemo(() => {
    let ctaButtonSx = {}
    const dropdownButtonSx = {}
    if (ctaButtonSx) {
      const {
        backgroundColor = '#7601D3',
        hoverBackgroundColor = 'rgb(94,34,169)',
        color = '#fff',
        hoverColor = '#fff',
        borderColor = 'transparent',
        hoverBorderColor = 'transparent',
        borderRadius = 4,
        borderWidth = 0,
        iconSize = 20,
      } = props.CTAButtonStyle || {}
      ctaButtonSx = {
        minWidth: 'unset',
        backgroundColor,
        color,
        hoverColor,
        borderColor,
        fontSize: `${iconSize}px`,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        '&:hover': {
          color: hoverColor,
          backgroundColor: hoverBackgroundColor,
          borderColor: hoverBorderColor,
        },
      }
    }
    return {
      ctaButtonSx,
    } as {
      ctaButtonSx: SxProps
    }
  }, [CTAButtonStyle, DropdownButtonStyle])
  useEffectOnce(() => {
    console.log('??????')
  })
  return (
    <Stack direction={'row'} alignItems={'center'} sx={InputAssistantBoxStyle}>
      <span>loading: {conversation.loading}</span>
      <span>darft: {conversation.writingMessage?.text}</span>
      <Button sx={memoButtonSx.ctaButtonSx} onClick={onClick}>
        <UseChatGptIcon
          sx={{
            fontSize: `inherit`,
            color: 'inherit',
          }}
        />
      </Button>
    </Stack>
  )
}

export default InputAssistantButton
