import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { base642file } from '@/background/utils/uplpadFileProcessHelper'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useAIProviderUpload from '@/features/chatgpt/hooks/useAIProviderUpload'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { formatClientUploadFiles } from '@/features/chatgpt/utils/clientUploadFiles'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  hideChatBox,
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { clientRunBackgroundGetScreenshot } from '@/utils/clientCallChromeExtensionCollection'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export const useUploadImagesAndSwitchToMaxAIVisionModel = () => {
  const { AIProviderConfig, aiProviderUploadFiles } = useAIProviderUpload()
  const { createConversation } = useClientConversation()
  const {
    updateSidebarConversationType,
    currentSidebarConversationType,
    sidebarSettings,
  } = useSidebarSettings()
  const { updateAIProviderModel, currentAIProvider, currentAIProviderModel } =
    useAIProviderModels()

  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const aiProviderUploadFilesRef = useRef(aiProviderUploadFiles)
  useEffect(() => {
    aiProviderUploadFilesRef.current = aiProviderUploadFiles
  }, [aiProviderUploadFiles])

  const uploadImagesAndSwitchToMaxAIVisionModel = async (
    imageFiles: File[],
  ) => {
    if (currentSidebarConversationType !== 'Chat') {
      await updateSidebarConversationType('Chat')
    }
    if (sidebarSettings?.chat?.conversationId) {
      const conversation = await clientGetConversation(
        sidebarSettings.chat.conversationId,
      )
      if (
        !conversation?.meta?.AIModel ||
        ![
          MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
          'claude-3-sonnet',
          'claude-3-opus',
        ].includes(conversation?.meta?.AIModel)
      ) {
        await updateAIProviderModel(
          'USE_CHAT_GPT_PLUS',
          MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
        )
        await createConversation('Chat')
      }
    } else {
      await updateAIProviderModel(
        'USE_CHAT_GPT_PLUS',
        MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      )
      await createConversation('Chat')
    }
    await aiProviderUploadFilesRef.current(
      await formatClientUploadFiles(imageFiles, AIProviderConfig?.maxFileSize),
    )
  }
  const isMaxAIVisionModel = useMemo(() => {
    if (
      currentAIProvider === 'USE_CHAT_GPT_PLUS' &&
      currentAIProviderModel === MAXAI_CHATGPT_MODEL_GPT_4_TURBO
    ) {
      return true
    }
    if (currentAIProvider === 'MAXAI_CLAUDE') {
      return ['claude-3-sonnet', 'claude-3-opus'].includes(
        currentAIProviderModel,
      )
    }
    return false
  }, [currentAIProvider, currentAIProviderModel])
  return {
    isMaxAIVisionModel,
    uploadImagesAndSwitchToMaxAIVisionModel,
  }
}

const SidebarScreenshotButton: FC<{
  sx?: SxProps
}> = ({ sx }) => {
  const { t } = useTranslation(['common'])
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)
  const { uploadImagesAndSwitchToMaxAIVisionModel } =
    useUploadImagesAndSwitchToMaxAIVisionModel()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        rootEl?.remove()
        setRootEl(null)
        showChatBox()
        return
      }
    }

    if (rootEl) {
      window.addEventListener('keydown', onKeyDown, true)
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [rootEl])

  return (
    <>
      <TextOnlyTooltip placement={'top'} title={t('common:ai_screenshot')}>
        <Button
          data-testid={'maxai-take-screenshot'}
          onClick={() => {
            const isImmersiveChatPage = isMaxAIImmersiveChatPage()
            if (!isImmersiveChatPage && isShowChatBox()) {
              hideChatBox()
            }
            const div = document.createElement('div')
            div.style.width = '100vw'
            div.style.height = '100vh'
            div.style.position = 'fixed'
            div.style.zIndex = '2147483647'
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
            onChange={async ({ imageFile }) => {
              rootEl?.remove()
              setRootEl(null)
              showChatBox()
              await uploadImagesAndSwitchToMaxAIVisionModel([imageFile])
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
    0, 0, 0, 0,
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
    setIsDragging(false)
    console.log(e)
    const base64Data = await clientRunBackgroundGetScreenshot(false)
    if (base64Data) {
      // 用canvas裁切
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.src = base64Data
      img.onload = () => {
        // 裁切图片
        // 基于屏幕的长宽，绘制图片
        const windowWidth = window.innerWidth
        // 计算原始图片和屏幕长宽的缩放
        const scale = img.naturalWidth / windowWidth
        const [x, y, width, height] = area.map((v) => v * scale)
        canvas.width = width
        canvas.height = height
        // draw Dimensions = width/height
        ctx?.drawImage(img, x, y, width, height, 0, 0, width, height)
        // ctx?.drawImage(img, x, y, width, height, 0, 0, width, height)
        const newBase64Data = canvas.toDataURL('image/png')
        // NOTE: debug用的
        // const zip = new JSZip()
        // zip.file(`cropped_w${width}_h${height}_x${x}_y${y}.txt`, '')
        // zip.file(`raw_w${img.naturalWidth}_h${img.naturalHeight}.txt`, '')
        // zip.file('raw.png', base64Data.split(',')[1], { base64: true })
        // zip.file('cropped.png', newBase64Data.split(',')[1], {
        //   base64: true,
        // })
        // zip.generateAsync({ type: 'blob' }).then(function (content) {
        //   saveAs(
        //     content,
        //     `screenshot_${dayjs().format('YYYY_MM_DD_HH_mm_ss')}.zip`,
        //   )
        // })
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
          top: `${area[1]}px`,
          left: `${area[0]}px`,
          width: `${area[2]}px`,
          height: `${area[3]}px`,
          outline: '3px dashed',
          outlineColor: '#9065B0',
        }}
      >
        {/*<span>*/}
        {/*  {area[2]}-{area[3]}*/}
        {/*</span>*/}
      </Box>
      {maskRects.map((mask, index) => {
        // const colors = ['#ff000030', '#00ff0030', '#0000ff30', '#ffff0030']
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
              // backgroundColor: colors[index],
            }}
          />
        )
      })}
    </Box>
  )
}
export default SidebarScreenshotButton
