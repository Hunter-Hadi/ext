/**
 * 渲染到页面中 右侧的 button
 */
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { useRecoilState, useRecoilValue } from 'recoil'
import Browser from 'webextension-polyfill'

import { useCreateClientMessageListener } from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useWindowSize from '@/features/common/hooks/useWindowSize'
import useCurrentPageLanguage from '@/features/pageTranslator/hook/useCurrentPageLanguage'
import { pageTranslationEnableAtom } from '@/features/pageTranslator/store'
import { MaxAIMinimumHideState } from '@/minimum/components/FloatingMenuButton/buttons/MaxAIHideMiniButton'
import MaxAIImmersiveChatButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIImmersiveChatButton'
import MaxAIMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIMiniButton'
import MaxAIPageTranslateButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIPageTranslateButton'
import MaxAIScreenshotMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIScreenshotMiniButton'
import MaxAISearchWithAIButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISearchWithAIButton'
import MaxAISettingsMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISettingsMiniButton'
import MaxAISummarizeButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISummarizeMiniButton'
import { checkWebpageIsArticlePage as checkIsArticlePage } from '@/minimum/utils'
const DEFAULT_TOP = window.innerHeight * 0.382

const aboveActionsCount = 3
const underActionsCount = 4
// 安全高度 = 按钮高度 + 16px
const safeTopY = aboveActionsCount * (32 + 6) + 16
const safeBottomYOffset = underActionsCount * (32 + 6) + 16

const saveBowserLocalStoreageFloatingButtonY = async (y: number) => {
  await Browser.storage.local.set({
    floatingButtonY: y,
  })
}
const getBowserLocalStoreageFloatingButtonY = async () => {
  const { floatingButtonY } = await Browser.storage.local.get('floatingButtonY')
  return floatingButtonY || DEFAULT_TOP
}

const FloatingMenuButton: FC = () => {
  const { height } = useWindowSize()
  const [maxAIMinimumHide] = useRecoilState(MaxAIMinimumHideState)
  const [isArticlePage, setIsArticlePage] = useState(false)
  const [dragAxisY, setDragAxisY] = useState(() => DEFAULT_TOP)
  const [isHover, setIsHover] = useState(false)
  const [isHoverButton, setIsHoverButton] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const currentDragAxisYRef = useRef(dragAxisY)
  const prevDragAxisYRef = useRef(dragAxisY)
  const [isLoaded, setIsLoaded] = useState(false)

  const translationEnable = useRecoilValue(pageTranslationEnableAtom)

  const { currentPageLanguageNotEqualTargetLanguage } = useCurrentPageLanguage()

  useEffect(() => {
    if (height) {
      if (dragAxisY < safeTopY || height <= safeTopY + safeBottomYOffset) {
        // 最小顶部安全高度
        setDragAxisY(safeTopY)
      } else if (dragAxisY > height - safeBottomYOffset) {
        // 最小低部安全高度
        setDragAxisY(height - safeBottomYOffset)
      } else if (height - 32 <= dragAxisY) {
        // 在安全高度之内
        const calcY = height - 32
        const newPosition = calcY <= 0 ? DEFAULT_TOP : calcY
        setDragAxisY(newPosition)
      }
    }
  }, [dragAxisY, height])
  useEffectOnce(() => {
    getBowserLocalStoreageFloatingButtonY()
      .then(setDragAxisY)
      .catch()
      .finally(() => {
        setIsLoaded(true)
      })
  })
  useEffect(() => {
    currentDragAxisYRef.current = dragAxisY
    saveBowserLocalStoreageFloatingButtonY(dragAxisY)
  }, [dragAxisY])
  const checkIsArticlePageDebounce = debounce(() => {
    setIsArticlePage(checkIsArticlePage())
  }, 1000)
  useEffectOnce(() => {
    setIsArticlePage(checkIsArticlePage())
  })
  useCreateClientMessageListener(async (event) => {
    if (event === 'Client_listenTabUrlUpdate') {
      checkIsArticlePageDebounce()
      return {
        success: true,
        message: 'ok',
        data: {},
      }
    }
    return undefined
  })

  const pageTranslateButtonShow = useMemo(() => {
    return (
      isHover || translationEnable || currentPageLanguageNotEqualTargetLanguage //如果探测到当前页面的语言和希望翻译的 target language不同，就会出现
    )
  }, [isHover, translationEnable, currentPageLanguageNotEqualTargetLanguage])

  const summarizeButtonShow = useMemo(() => {
    return isHover || isArticlePage
  }, [isHover, isArticlePage])

  if (!isLoaded || maxAIMinimumHide) {
    return null
  }
  return (
    <Box
      sx={{
        width: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 2147483647,
      }}
    >
      <Draggable
        disabled={!isHoverButton}
        bounds='parent'
        position={{ x: 0, y: dragAxisY }}
        axis='y'
        scale={1}
        onStart={() => {}}
        onStop={(_, data) => {
          if (isDragging) {
            setDragAxisY(data.y)
            setIsHover(false)
            setIsDragging(false)
          }
        }}
        onDrag={(_, data) => {
          console.log('MaxAIMiniButton drag', isHoverButton)
          currentDragAxisYRef.current = data.y
          setIsDragging(true)
          setIsHover(true)
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 42,
            right: 0,
            top: 0,
            userSelect: 'none',
          }}
        >
          <ClickAwayListener
            onClickAway={() => {
              setIsHover(false)
              setIsDragging(false)
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 32,
                transform:
                  isHover || summarizeButtonShow || pageTranslateButtonShow
                    ? 'translateX(0)'
                    : 'translateX(10px)',
                transition: '0.1s all',
                borderRadius: '27px 0 0 27px',
                bgcolor: 'background.paper',
                boxShadow:
                  '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
                cursor: 'pointer',
              }}
              onMouseLeave={() => {
                setIsHover(false)
                setIsHoverButton(false)
              }}
              onMouseDown={() => {
                prevDragAxisYRef.current = dragAxisY
              }}
            >
              <MaxAIMiniButton
                onMouseEnter={() => {
                  setIsHover(true)
                  setIsHoverButton(true)
                  console.log('MaxAIMiniButton enter')
                }}
                onMouseLeave={() => {
                  setIsHoverButton(false)
                  console.log('MaxAIMiniButton onMouseLeave')
                }}
                isDragging={isDragging}
                onClick={() => {
                  if (
                    Math.abs(
                      prevDragAxisYRef.current - currentDragAxisYRef.current,
                    ) > 5
                  ) {
                    return
                  }
                  const port = new ContentScriptConnectionV2()
                  port.postMessage({
                    event: 'Client_emitCMDJ',
                    data: {},
                  })
                }}
                aboveNode={
                  <Stack spacing={'6px'}>
                    {isHover && (
                      <MaxAISearchWithAIButton
                        key={'MaxAISearchWithAIButton'}
                      />
                    )}
                    {isHover && (
                      <MaxAIScreenshotMiniButton
                        key={'MaxAIScreenshotButton'}
                      />
                    )}
                    {summarizeButtonShow && (
                      <MaxAISummarizeButton key={'MaxAISummarizeButton'} />
                    )}
                  </Stack>
                }
                underNode={
                  <Stack spacing={'6px'}>
                    <MaxAIPageTranslateButton
                      key={'MaxAIPageTranslateButton'}
                      onAdvancedClose={() => {
                        setIsHover(false)
                        setIsHoverButton(false)
                      }}
                      sx={{
                        display: pageTranslateButtonShow ? 'block' : 'none',
                      }}
                    />
                    {isHover && (
                      <MaxAIImmersiveChatButton
                        key={'MaxAIImmersiveChatButton'}
                      />
                    )}
                    {isHover && (
                      <MaxAISettingsMiniButton
                        key={'MaxAISettingsMiniButton'}
                      />
                    )}
                  </Stack>
                }
              />
            </Box>
          </ClickAwayListener>
        </Box>
      </Draggable>
    </Box>
  )
}

export default FloatingMenuButton
