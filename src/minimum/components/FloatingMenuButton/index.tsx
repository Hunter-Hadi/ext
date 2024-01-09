/**
 * 渲染到页面中 右侧的 button
 */
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { useRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { useCreateClientMessageListener } from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useWindowSize from '@/features/common/hooks/useWindowSize'
import { MaxAIMinimumHideState } from '@/minimum/components/FloatingMenuButton/buttons/MaxAIHideMiniButton'
import MaxAIMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIMiniButton'
import MaxAISearchWithAIButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISearchWithAIButton'
import MaxAISettingsMiniButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISettingsMiniButton'
import MaxAISummarizeButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAISummarizeMiniButton'
import { isArticlePage } from '@/minimum/utils'
const DEFAULT_TOP = window.innerHeight * 0.382

const actionsCount = 4
const safeTopY = actionsCount * (32 + 6)

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
  const [isKeepShow, setIsKeepShow] = useState(false)
  const [dragAxisY, setDragAxisY] = useState(() => DEFAULT_TOP)
  const [isHover, setIsHover] = useState(false)
  const [isHoverButton, setIsHoverButton] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const currentDragAxisYRef = useRef(dragAxisY)
  const prevDragAxisYRef = useRef(dragAxisY)
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    if (height && height - 32 <= dragAxisY) {
      const calcY = height - 32
      const newPosition = calcY <= 0 ? DEFAULT_TOP : calcY
      setDragAxisY(newPosition)
    } else if (dragAxisY < safeTopY) {
      // 最小顶部高度
      setDragAxisY(safeTopY)
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
  const checkIsKeepShow = debounce(() => {
    console.log('checkIsKeepShow', isArticlePage())
    setIsKeepShow(isArticlePage())
  }, 1000)
  useEffectOnce(() => {
    setIsKeepShow(isArticlePage())
  })
  useCreateClientMessageListener(async (event) => {
    if (event === 'Client_listenTabUrlUpdate') {
      checkIsKeepShow()
      return {
        success: true,
        message: 'ok',
        data: {},
      }
    }
    return undefined
  })
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
        bounds="parent"
        position={{ x: 0, y: dragAxisY }}
        axis="y"
        scale={1}
        onStart={() => {}}
        onStop={(e, data) => {
          if (isDragging) {
            setDragAxisY(data.y)
            setIsHover(false)
            setIsDragging(false)
          }
        }}
        onDrag={(e, data) => {
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
          <Box
            sx={{
              width: 42,
              height: 32,
              transform:
                isHover || isKeepShow ? 'translateX(0)' : 'translateX(10px)',
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
            >
              <Stack pb={'6px'} spacing={'6px'}>
                {isHover && (
                  <MaxAISettingsMiniButton key={'MaxAISettingsMiniButton'} />
                )}
                {isHover && (
                  <MaxAISearchWithAIButton key={'MaxAISearchWithAIButton'} />
                )}
                {(isHover || isKeepShow) && (
                  <MaxAISummarizeButton key={'MaxAISummarizeButton'} />
                )}
              </Stack>
            </MaxAIMiniButton>
          </Box>
        </Box>
      </Draggable>
    </Box>
  )
}

export default FloatingMenuButton
