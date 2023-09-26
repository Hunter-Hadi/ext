import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
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
import { IInputAssistantButton } from '@/features/contextMenu/components/InputAssistantButton/config'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useTranslation } from 'react-i18next'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import cloneDeep from 'lodash-es/cloneDeep'
import { ROOT_MINIMIZE_CONTAINER_ID } from '@/constants'
import Box from '@mui/material/Box'

// 按钮位置选项
type InputAssistantButtonPosition =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'right'
  | 'top-end'
  | 'top-start'
  | 'top'

// 按钮尺寸选项
type InputAssistantButtonSize = 'small' | 'medium' | 'large'

// 按钮样式配置
export interface InputAssistantButtonStyle {
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
  shadowRoot: ShadowRoot
  rootId: string
  buttonMode?: 'fixed' | 'static' // 按钮模式
  buttonPosition?: InputAssistantButtonPosition // 按钮位置
  buttonSize?: InputAssistantButtonSize // 按钮尺寸
  CTAButtonStyle?: InputAssistantButtonStyle // 按钮样式
  DropdownButtonStyle?: InputAssistantButtonStyle // 按钮样式
  InputAssistantBoxSx?: SxProps // 按钮容器样式
  buttonGroup: IInputAssistantButton[] // 按钮组
  placement?: InputAssistantButtonPosition // 按钮弹出位置
}
const InputAssistantButton: FC<InputAssistantButtonProps> = (props) => {
  const {
    rootId,
    InputAssistantBoxSx,
    DropdownButtonStyle,
    CTAButtonStyle,
    buttonGroup,
    shadowRoot,
    placement,
  } = props
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  const { t } = useTranslation(['client'])
  const [
    contextMenuContainer,
    setContextMenuContainer,
  ] = useState<HTMLElement | null>(null)
  const { loading } = useRecoilValue(ChatGPTConversationState)
  const [isCTAHover, setIsCTAHover] = useState(false)
  const [isBoxHover, setIsBoxHover] = useState(false)
  const [ctaTooltipShow, setCtaTooltipShow] = useState(false)
  const [dropdownTooltipShow, setDropdownTooltipShow] = useState(false)
  const memoButtonSx = useMemo(() => {
    let cloneCTAButtonStyle = cloneDeep(CTAButtonStyle)
    let cloneDropdownButtonStyle = cloneDeep(DropdownButtonStyle)
    let ctaButtonSx = {}
    let dropdownButtonSx = {}
    buttonGroup.forEach((button) => {
      if (button.CTAButtonStyle) {
        cloneCTAButtonStyle = Object.assign(cloneCTAButtonStyle, {
          ...button.CTAButtonStyle,
        })
      }
      if (button.DropdownButtonStyle) {
        cloneDropdownButtonStyle = Object.assign(cloneDropdownButtonStyle, {
          ...button.DropdownButtonStyle,
        })
      }
    })
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
      } = cloneCTAButtonStyle || {}
      ctaButtonSx = {
        minWidth: 'unset',
        backgroundColor,
        color,
        borderColor,
        borderRadius,
        fontSize: `${iconSize}px`,
        borderWidth: borderWidth,
        borderStyle: 'solid',
        position: 'relative',
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
      } = cloneDropdownButtonStyle || {}
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
  }, [CTAButtonStyle, DropdownButtonStyle, isCTAHover, buttonGroup])
  const inputAssistantBoxStyle = useMemo(() => {
    const cloneSx = (cloneDeep(InputAssistantBoxSx) as any) || {}
    buttonGroup.forEach((button) => {
      if (button.InputAssistantBoxSx) {
        Object.assign(cloneSx, button.InputAssistantBoxSx)
      }
    })
    const InputAssistantBoxSxHover = {
      boxShadow:
        '0px 2px 3px 1px rgba(118, 1, 211, 0.16), 1px 0px 2px 0px rgba(118, 1, 211, 0.08), -1px 0px 2px 0px rgba(118, 1, 211, 0.08)',
      ...(cloneSx?.['&:hover'] as React.CSSProperties),
    }
    if (InputAssistantBoxSxHover) {
      delete cloneSx['&:hover']
    }
    return {
      ...cloneSx,
      ...(isBoxHover ? InputAssistantBoxSxHover : {}),
    } as React.CSSProperties
  }, [InputAssistantBoxSx, isBoxHover, buttonGroup])
  useEffect(() => {
    if (shadowRoot) {
      const emotionRoot = document.createElement('style')
      shadowRoot.appendChild(emotionRoot)
      emotionCacheRef.current = createCache({
        key: `max-ai-input-assistant-context-menu`,
        prepend: true,
        container: emotionRoot,
      })
    }
  }, [shadowRoot])
  useEffect(() => {
    setContextMenuContainer(
      document
        .querySelector(`#${ROOT_MINIMIZE_CONTAINER_ID}`)
        ?.shadowRoot?.querySelector('div') as HTMLElement,
    )
  }, [])
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '4px',
        ...inputAssistantBoxStyle,
      }}
      onMouseEnter={() => setIsBoxHover(true)}
      onMouseLeave={() => setIsBoxHover(false)}
    >
      {buttonGroup[0] && (
        <InputAssistantButtonContextMenu
          rootId={rootId}
          buttonKey={buttonGroup[0].buttonKey}
          permissionWrapperCardSceneType={
            buttonGroup[0].permissionWrapperCardSceneType
          }
          root={contextMenuContainer as HTMLElement}
        >
          <Box>
            <TextOnlyTooltip
              placement={placement}
              open={ctaTooltipShow}
              zIndex={2000000}
              PopperProps={{
                container: contextMenuContainer as HTMLElement,
              }}
              title={t(buttonGroup[0].tooltip as any)}
            >
              <div style={{ display: 'flex' }}>
                {emotionCacheRef.current && (
                  <CacheProvider value={emotionCacheRef.current}>
                    <Button
                      id={`maxAIInputAssistantCtaButton${rootId}`}
                      maxai-input-assistant-cta-button={`ctaButton${rootId}`}
                      disabled={loading}
                      sx={memoButtonSx.ctaButtonSx}
                      onMouseEnter={() => {
                        setIsCTAHover(true)
                        setCtaTooltipShow(true)
                      }}
                      onMouseLeave={() => {
                        setIsCTAHover(false)
                        setCtaTooltipShow(false)
                      }}
                      onClick={() => {
                        setCtaTooltipShow(false)
                      }}
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
                  </CacheProvider>
                )}
              </div>
            </TextOnlyTooltip>
          </Box>
        </InputAssistantButtonContextMenu>
      )}
      {buttonGroup[1] && (
        <InputAssistantButtonContextMenu
          rootId={rootId}
          buttonKey={buttonGroup[1].buttonKey}
          permissionWrapperCardSceneType={
            buttonGroup[1].permissionWrapperCardSceneType
          }
          root={contextMenuContainer as HTMLElement}
        >
          <Box>
            <TextOnlyTooltip
              placement={placement}
              open={dropdownTooltipShow}
              zIndex={2000000}
              PopperProps={{
                container: contextMenuContainer as HTMLElement,
              }}
              title={t(buttonGroup[1].tooltip as any)}
            >
              <div style={{ display: 'flex' }}>
                {emotionCacheRef.current && (
                  <CacheProvider value={emotionCacheRef.current}>
                    <Button
                      id={`maxAIInputAssistantDropdownButton${rootId}`}
                      maxai-input-assistant-dropdown-button={`dropdownButton${rootId}`}
                      disabled={loading}
                      sx={memoButtonSx.dropdownButtonSx}
                      onMouseEnter={() => {
                        setDropdownTooltipShow(true)
                      }}
                      onMouseLeave={() => {
                        setDropdownTooltipShow(false)
                      }}
                      onClick={() => {
                        setDropdownTooltipShow(false)
                      }}
                    >
                      <ContextMenuIcon
                        icon={'ArrowDropDown'}
                        sx={{
                          fontSize: `inherit`,
                          color: 'inherit',
                        }}
                      />
                    </Button>
                  </CacheProvider>
                )}
              </div>
            </TextOnlyTooltip>
          </Box>
        </InputAssistantButtonContextMenu>
      )}
    </div>
  )
}

export default InputAssistantButton
