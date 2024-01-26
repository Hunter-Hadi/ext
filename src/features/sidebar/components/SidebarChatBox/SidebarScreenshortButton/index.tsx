import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { base642file } from '@/background/utils/uplpadFileProcessHelper'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { MaxAIChatFileHandleUploadState } from '@/features/chatgpt/components/ChatIconFileUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import {
  hideChatBox,
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { clientRunBackgroundGetScreenshot } from '@/utils/clientCallChromeExtensionCollection'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export const takeShortcutScreenshot = () => {
  getMaxAISidebarRootElement()
    ?.querySelector('[data-testid="maxai-take-screenshot"]')
    ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}
const SidebarScreenshotButton: FC<{
  sx?: SxProps
}> = ({ sx }) => {
  const { t } = useTranslation(['common'])
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)
  const maxAIChatFileHandleUpload = useRecoilValue(
    MaxAIChatFileHandleUploadState,
  )
  const {
    updateAIProviderModel,
    currentAIProvider,
    currentAIProviderModel,
  } = useAIProviderModels()
  return (
    <>
      <TextOnlyTooltip placement={'top'} title={t('common:screenshot')}>
        <Button
          data-testid={'maxai-take-screenshot'}
          onClick={() => {
            if (!isMaxAIImmersiveChatPage() && isShowChatBox()) {
              hideChatBox()
            }
            if (
              currentAIProvider !== 'USE_CHAT_GPT_PLUS' ||
              currentAIProviderModel !== 'gpt-4-vision-preview'
            ) {
              updateAIProviderModel('USE_CHAT_GPT_PLUS', 'gpt-4-vision-preview')
                .then()
                .catch()
            }
            const div = document.createElement('div')
            document.body.appendChild(div)
            setRootEl(div)
          }}
          sx={{
            p: '5px',
            minWidth: 'unset',
            ...sx,
          }}
          variant={'outlined'}
        >
          <ContentCutOutlinedIcon
            sx={{
              transform: 'rotate(-90deg)',
              fontSize: '20px',
            }}
          />
        </Button>
      </TextOnlyTooltip>
      {rootEl && (
        <DynamicComponent
          customElementName={'max-ai-screenshot'}
          rootContainer={rootEl}
        >
          <ScreenshotComponent
            onChange={({ imageFile }) => {
              setRootEl(null)
              showChatBox()
              maxAIChatFileHandleUpload.uploadFile(imageFile)
            }}
          />
        </DynamicComponent>
      )}
    </>
  )
}
const ScreenshotComponent: FC<{
  onChange?: (data: { rect: number[]; image: string; imageFile: File }) => void
}> = (props) => {
  const { onChange } = props
  const [isDragging, setIsDragging] = useState(false)
  const startPointRef = React.useRef<[number, number]>([0, 0])
  const [area, setArea] = useState<[number, number, number, number]>([
    0,
    0,
    0,
    0,
  ])
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e)
    startPointRef.current = [e.clientX, e.clientY]
    setIsDragging(true)
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e)
    if (isDragging) {
      const [startX, startY] = startPointRef.current
      const [endX, endY] = [e.clientX, e.clientY]
      const [x, y, width, height] = [
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(startX - endX),
        Math.abs(startY - endY),
      ]
      setArea([x, y, width, height])
    }
  }
  const handleDragEnd = async (e: React.MouseEvent<HTMLDivElement>) => {
    console.log(e)
    setIsDragging(false)
    const base64Data = await clientRunBackgroundGetScreenshot(
      window.location.href,
      false,
    )
    if (base64Data) {
      // 用canvas裁切
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.src = base64Data
      img.onload = () => {
        // 裁切图片
        const [x, y, width, height] = area
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(
          img,
          x + 3,
          y + 3,
          width - 3,
          height - 3,
          0,
          0,
          width,
          height,
        )
        const newBase64Data = canvas.toDataURL('image/png')
        canvas.toBlob((blob) => {
          console.log(blob)
          if (blob) {
            onChange?.({
              image: newBase64Data,
              rect: area,
              imageFile: new File([blob], 'screenshot.png', {
                type: 'image/png',
              }),
            })
          } else {
            // 用base64转换
            console.error('blob is null')
            const file = base642file(newBase64Data, 'screenshot.png')
            onChange?.({
              image: newBase64Data,
              rect: area,
              imageFile: file!,
            })
          }
        })
      }
    }
  }
  const maskRects = useMemo(() => {
    // 基于area矩形，计算出四个遮罩
    const [, , screenWidth, screenHeight] = [
      0,
      0,
      window.innerWidth,
      window.innerHeight,
    ]
    const [x = 0, y = 0, width = 0, height = 0] = area
    const rects = [
      [0, 0, width + x, y],
      [x + width, 0, screenWidth - x - width, y + height],
      [0, y, x, screenHeight - y],
      [x, y + height, screenWidth - x, screenHeight - y - height],
    ]
    return rects
  }, [area])
  return (
    <Box
      onMouseDown={handleDragStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      position={'fixed'}
      sx={{
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 2147483647,
        cursor: 'crosshair',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: area[1],
          left: area[0],
          width: area[2],
          height: area[3],
          outline: '3px dashed',
          outlineColor: '#7601D3',
        }}
      ></Box>
      {maskRects.map((mask, index) => {
        return (
          <Box
            key={mask.join(',')}
            sx={{
              position: 'absolute',
              top: mask[1],
              left: mask[0],
              width: mask[2],
              height: mask[3],
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
        )
      })}
    </Box>
  )
}
export default SidebarScreenshotButton
