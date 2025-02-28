import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ContextMenuIcon,
  IContextMenuIconKey,
} from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { isProduction } from '@/constants'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { MAXAI_MINIMIZE_CONTAINER_ID } from '@/features/common/constants'
import InputAssistantButtonContextMenu from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonContextMenu'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'

import { type IInputAssistantButtonObserverData } from './InputAssistantButtonManager'

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
  borderRadius?: string | number // 按钮圆角
  borderWidth?: string | number // 按钮边框宽度
  iconSize?: number // 按钮文字大小
  margin?: string | number // 按钮外边距
  padding?: string | number // 按钮内边距
  icon?: IContextMenuIconKey // 按钮图标
  transparentHeight?: number // 透明的可点击高度
  height?: string | number // 按钮高度
}

interface InputAssistantButtonProps {
  buttonMode?: 'fixed' | 'static' // 按钮模式
  buttonPosition?: InputAssistantButtonPosition // 按钮位置
  buttonSize?: InputAssistantButtonSize // 按钮尺寸
  placement?: InputAssistantButtonPosition // 按钮弹出位置
  observerData: IInputAssistantButtonObserverData
}
const InputAssistantButton: FC<InputAssistantButtonProps> = (props) => {
  const { observerData, placement } = props
  const {
    id: rootId,
    config: buttonConfig,
    buttonGroup, // 按钮组
    shadowRootElement: shadowRoot,
  } = observerData
  const {
    InputAssistantBoxSx, // 按钮容器样式
    DropdownButtonStyle, // 按钮样式
    CTAButtonStyle, // 按钮样式
    instantReplyWebsiteType,
  } = buttonConfig
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  const { t } = useTranslation(['client'])
  const [contextMenuContainer, setContextMenuContainer] =
    useState<HTMLElement | null>(null)
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [isCTAHover, setIsCTAHover] = useState(false)
  const [isBoxHover, setIsBoxHover] = useState(false)
  const memoButtonSx = useMemo<{
    ctaButtonSx: SxProps
    dropdownButtonSx: SxProps
  }>(() => {
    let cloneCTAButtonStyle = cloneDeep(CTAButtonStyle)
    let cloneDropdownButtonStyle = cloneDeep(DropdownButtonStyle)
    let ctaButtonSx = {}
    let dropdownButtonSx = {}
    buttonGroup.forEach((button) => {
      if (button.CTAButtonStyle) {
        cloneCTAButtonStyle = Object.assign(cloneCTAButtonStyle || {}, {
          ...button.CTAButtonStyle,
        })
      }
      if (button.DropdownButtonStyle) {
        cloneDropdownButtonStyle = Object.assign(
          cloneDropdownButtonStyle || {},
          {
            ...button.DropdownButtonStyle,
          },
        )
      }
    })
    if (ctaButtonSx) {
      const {
        backgroundColor = 'customColor.main',
        hoverBackgroundColor = 'customColor.hoverColor',
        color = '#fff',
        hoverColor = '#fff',
        borderColor = 'rgb(77, 26, 137)',
        hoverBorderColor = 'rgb(77, 26, 137)',
        borderRadius = '4px 0 0 4px',
        borderWidth = '0 1px 0 0',
        iconSize = 20,
        padding = '8px 12px',
        ...restStyles
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
        iconSize,
        '&:hover': {
          color: hoverColor,
          backgroundColor: hoverBackgroundColor,
          borderColor: hoverBorderColor,
        },
        ...restStyles,
      }
    }
    if (dropdownButtonSx) {
      const {
        backgroundColor = 'customColor.main',
        hoverBackgroundColor = 'customColor.hoverColor',
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
        iconSize,
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
        .querySelector(`#${MAXAI_MINIMIZE_CONTAINER_ID}`)
        ?.shadowRoot?.querySelector('div') as HTMLElement,
    )
  }, [])

  return (
    <div
      style={{
        height: 'inherit',
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
        <>
          <InputAssistantButtonContextMenu
            rootId={rootId}
            buttonKey={buttonGroup[0].buttonKey}
            permissionWrapperCardSceneType={
              buttonGroup[0].permissionWrapperCardSceneType
            }
            root={contextMenuContainer as HTMLElement}
            shadowRoot={shadowRoot}
            onSelectionEffect={
              buttonGroup[0]?.onSelectionEffect &&
              (() => buttonGroup[0].onSelectionEffect!(observerData))
            }
            instantReplyWebsiteType={instantReplyWebsiteType}
            disabled={smoothConversationLoading}
          >
            <Box style={{ width: '100%', height: 'inherit' }} component='div'>
              <TextOnlyTooltip
                placement={placement}
                zIndex={2000000}
                PopperProps={{
                  container: contextMenuContainer as HTMLElement,
                }}
                title={
                  buttonGroup[0]?.tooltip
                    ? t(buttonGroup[0].tooltip as any)
                    : ''
                }
              >
                <div
                  style={{
                    height: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => {
                    setIsCTAHover(true)
                  }}
                  onMouseLeave={() => {
                    setIsCTAHover(false)
                  }}
                >
                  {emotionCacheRef.current && (
                    <CacheProvider value={emotionCacheRef.current}>
                      <Box
                        position={'absolute'}
                        top={`-${CTAButtonStyle?.transparentHeight || 0}px`}
                        width={'100%'}
                        height={`${CTAButtonStyle?.transparentHeight || 0}px`}
                        bgcolor={isProduction ? 'transparent' : 'red'}
                        zIndex={2000001}
                      />
                      <Button
                        id={`maxAIInputAssistantCtaButton${rootId}`}
                        data-testid={'maxai-input-assistant-cta-button'}
                        data-button-key={buttonGroup[0].buttonKey}
                        disabled={smoothConversationLoading}
                        sx={memoButtonSx.ctaButtonSx}
                      >
                        {smoothConversationLoading ? (
                          <CircularProgress
                            size={
                              (memoButtonSx.ctaButtonSx as any)?.iconSize || 16
                            }
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
                        {buttonGroup[0].displayText && (
                          <Typography
                            component={'span'}
                            fontSize={'14px'}
                            sx={buttonGroup[0].displayTextSx}
                          >
                            {typeof buttonGroup[0].displayText === 'function'
                              ? buttonGroup[0].displayText(t)
                              : buttonGroup[0].displayText}
                          </Typography>
                        )}
                      </Button>
                      <Box
                        position={'absolute'}
                        bottom={`-${CTAButtonStyle?.transparentHeight || 0}px`}
                        width={'100%'}
                        height={`${CTAButtonStyle?.transparentHeight || 0}px`}
                        bgcolor={isProduction ? 'transparent' : 'red'}
                        zIndex={2000001}
                      />
                    </CacheProvider>
                  )}
                </div>
              </TextOnlyTooltip>
            </Box>
          </InputAssistantButtonContextMenu>
          {buttonGroup[0].onboardingTooltipSceneType &&
          emotionCacheRef.current ? (
            <CacheProvider value={emotionCacheRef.current}>
              <OnboardingTooltipPortal
                container={shadowRoot.querySelector<HTMLElement>(
                  'div:first-of-type',
                )}
                sceneType={buttonGroup[0].onboardingTooltipSceneType}
              />
            </CacheProvider>
          ) : null}
        </>
      )}
      {buttonGroup[1] && (
        <>
          <InputAssistantButtonContextMenu
            rootId={rootId}
            buttonKey={buttonGroup[1].buttonKey}
            permissionWrapperCardSceneType={
              buttonGroup[1].permissionWrapperCardSceneType
            }
            root={contextMenuContainer as HTMLElement}
            shadowRoot={shadowRoot}
            onSelectionEffect={
              buttonGroup[1]?.onSelectionEffect &&
              (() => buttonGroup[1].onSelectionEffect!(observerData))
            }
            instantReplyWebsiteType={instantReplyWebsiteType}
            disabled={smoothConversationLoading}
          >
            <Box>
              <TextOnlyTooltip
                placement={placement}
                zIndex={2000000}
                PopperProps={{
                  container: contextMenuContainer as HTMLElement,
                }}
                title={
                  buttonGroup[1]?.tooltip
                    ? t(buttonGroup[1].tooltip as any)
                    : ''
                }
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  {emotionCacheRef.current && (
                    <CacheProvider value={emotionCacheRef.current}>
                      <Box
                        position={'absolute'}
                        top={`-${
                          DropdownButtonStyle?.transparentHeight || 0
                        }px`}
                        width={'100%'}
                        height={`${
                          DropdownButtonStyle?.transparentHeight || 0
                        }px`}
                        bgcolor={isProduction ? 'transparent' : 'red'}
                        zIndex={2000001}
                      />
                      <Button
                        id={`maxAIInputAssistantDropdownButton${rootId}`}
                        data-testid={'maxai-input-assistant-dropdown-button'}
                        data-button-key={buttonGroup[1].buttonKey}
                        disabled={smoothConversationLoading}
                        sx={memoButtonSx.dropdownButtonSx}
                      >
                        <ContextMenuIcon
                          icon={'ArrowDropDown'}
                          sx={{
                            fontSize: `inherit`,
                            color: 'inherit',
                          }}
                        />
                      </Button>
                      <Box
                        position={'absolute'}
                        bottom={`-${
                          DropdownButtonStyle?.transparentHeight || 0
                        }px`}
                        width={'100%'}
                        height={`${
                          DropdownButtonStyle?.transparentHeight || 0
                        }px`}
                        bgcolor={isProduction ? 'transparent' : 'red'}
                        zIndex={2000001}
                      />
                    </CacheProvider>
                  )}
                </div>
              </TextOnlyTooltip>
            </Box>
          </InputAssistantButtonContextMenu>
          {buttonGroup[1].onboardingTooltipSceneType &&
          emotionCacheRef.current ? (
            <CacheProvider value={emotionCacheRef.current}>
              <OnboardingTooltipPortal
                container={shadowRoot.querySelector<HTMLElement>(
                  'div:first-of-type',
                )}
                sceneType={buttonGroup[1].onboardingTooltipSceneType}
              />
            </CacheProvider>
          ) : null}
        </>
      )}
    </div>
  )
}

export default InputAssistantButton
