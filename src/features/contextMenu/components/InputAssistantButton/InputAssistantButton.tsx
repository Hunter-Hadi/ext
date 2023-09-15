import React, { FC, useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { SxProps } from '@mui/material/styles'
import {
  ContextMenuIcon,
  IContextMenuIconKey,
} from '@/components/ContextMenuIcon'
import InputAssistantButtonContextMenu from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonContextMenu'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'
import CircularProgress from '@mui/material/CircularProgress'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'

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
  borderRadius?: string // 按钮圆角
  borderWidth?: string // 按钮边框宽度
  iconSize?: number // 按钮文字大小
  margin?: string // 按钮外边距
  padding?: string // 按钮内边距
  icon?: IContextMenuIconKey // 按钮图标
}

interface InputAssistantButtonProps {
  root: HTMLElement
  rootId: string
  buttonKeys: IChromeExtensionButtonSettingKey[] // 按钮配置
  buttonMode?: 'fixed' | 'static' // 按钮模式
  buttonPosition?: InputAssistantButtonPosition // 按钮位置
  buttonSize?: InputAssistantButtonSize // 按钮尺寸
  CTAButtonStyle?: InputAssistantButtonStyle // 按钮样式
  DropdownButtonStyle?: InputAssistantButtonStyle // 按钮样式
  InputAssistantBoxStyle?: SxProps // 按钮容器样式
}
const InputAssistantButton: FC<InputAssistantButtonProps> = (props) => {
  const { loading } = useRecoilValue(ChatGPTConversationState)
  const {
    root,
    rootId,
    InputAssistantBoxStyle,
    DropdownButtonStyle,
    CTAButtonStyle,
    buttonKeys,
  } = props
  const [isCTAHover, setCTAIsHover] = useState(false)
  const memoButtonSx = useMemo(() => {
    let ctaButtonSx = {}
    let dropdownButtonSx = {}
    if (ctaButtonSx) {
      const {
        backgroundColor = '#7601D3',
        hoverBackgroundColor = 'rgb(94,34,169)',
        color = '#fff',
        hoverColor = '#fff',
        borderColor = 'rgb(77, 26, 137)',
        hoverBorderColor = 'rgb(77, 26, 137)',
        borderRadius = '4px 0 0 4px',
        borderWidth = '0 1px 0 0',
        iconSize = 20,
        padding = '8px 12px',
      } = props.CTAButtonStyle || {}
      ctaButtonSx = {
        minWidth: 'unset',
        backgroundColor,
        color,
        borderColor,
        borderRadius,
        fontSize: `${iconSize}px`,
        borderWidth: borderWidth,
        borderStyle: 'solid',
        padding,
        '&:hover': {
          color: hoverColor,
          backgroundColor: hoverBackgroundColor,
          borderColor: hoverBorderColor,
        },
      }
    }
    if (dropdownButtonSx) {
      const {
        backgroundColor = '#7601D3',
        hoverBackgroundColor = 'rgb(94,34,169)',
        color = '#fff',
        hoverColor = '#fff',
        borderColor = 'transparent',
        hoverBorderColor = 'transparent',
        borderRadius = '0 4px 4px 0',
        borderWidth = '0',
        iconSize = 20,
        padding = '8px 4px',
      } = props.CTAButtonStyle || {}
      dropdownButtonSx = {
        minWidth: 'unset',
        backgroundColor: isCTAHover ? hoverBackgroundColor : backgroundColor,
        color: isCTAHover ? hoverColor : color,
        borderColor: isCTAHover ? hoverBorderColor : borderColor,
        borderRadius,
        fontSize: `${iconSize}px`,
        borderWidth: borderWidth,
        borderStyle: 'solid',
        padding,
        '&:hover': {
          color: hoverColor,
          backgroundColor: hoverBackgroundColor,
          borderColor: hoverBorderColor,
        },
      }
    }
    return {
      ctaButtonSx,
      dropdownButtonSx,
    } as {
      ctaButtonSx: SxProps
      dropdownButtonSx: SxProps
    }
  }, [CTAButtonStyle, DropdownButtonStyle, isCTAHover])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{
        borderRadius: '4px',
        '&:hover': {
          boxShadow:
            '0px 2px 3px 1px rgba(118, 1, 211, 0.16), 1px 0px 2px 0px rgba(118, 1, 211, 0.08), -1px 0px 2px 0px rgba(118, 1, 211, 0.08)',
        },
        ...InputAssistantBoxStyle,
      }}
    >
      {buttonKeys[0] && (
        <InputAssistantButtonContextMenu
          rootId={rootId}
          buttonKey={buttonKeys[0]}
          root={root}
        >
          <Button
            disabled={loading}
            sx={memoButtonSx.ctaButtonSx}
            onMouseEnter={() => setCTAIsHover(true)}
            onMouseLeave={() => setCTAIsHover(false)}
          >
            {loading ? (
              <CircularProgress
                size={CTAButtonStyle?.iconSize || 20}
                sx={{
                  fontSize: `inherit`,
                  color: '#fff',
                }}
              />
            ) : (
              <UseChatGptIcon
                sx={{
                  fontSize: `inherit`,
                  color: 'inherit',
                }}
              />
            )}
          </Button>
        </InputAssistantButtonContextMenu>
      )}
      {buttonKeys[1] && (
        <InputAssistantButtonContextMenu
          rootId={rootId}
          buttonKey={buttonKeys[1]}
          root={root}
        >
          <Button disabled={loading} sx={memoButtonSx.dropdownButtonSx}>
            <ContextMenuIcon
              icon={'ArrowDropDown'}
              sx={{
                fontSize: `inherit`,
                color: 'inherit',
              }}
            />
          </Button>
        </InputAssistantButtonContextMenu>
      )}
    </Stack>
  )
}

export default InputAssistantButton
