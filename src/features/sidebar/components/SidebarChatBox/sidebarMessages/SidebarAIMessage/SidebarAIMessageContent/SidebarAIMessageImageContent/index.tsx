import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import DevContent from '@/components/DevContent'
import LazyLoadImage from '@/components/LazyLoadImage'
import { IArtTextToImageMetadata } from '@/features/art/types'
import { artTextToAspectRatio } from '@/features/art/utils'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import SidebarAIMessageImageContentDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent/SidebarAIMessageImageContentDownloadButton'

type AIMessageImageData = {
  url: string
  downloadUrl?: string
} & IArtTextToImageMetadata
type AIMessageImageRenderData = {
  imageBoxWidth: number
  imageBoxHeight: number
  imageBoxTop: number
  imageBoxLeft: number
  image: AIMessageImageData
}

const SidebarAIMessageImageContent: FC<{
  AIMessage: IAIResponseMessage
}> = (props) => {
  const { AIMessage } = props
  const boxRef = useRef<HTMLElement | null>(null)
  const [boxRect, setBoxRect] = useState([0, 0])
  const [count, setCount] = useState(1)
  const [b, setB] = useState('1:1')
  const renderDataList = useMemo<Array<AIMessageImageRenderData>>(() => {
    try {
      let images =
        JSON.parse(AIMessage.originalMessage?.content?.text || '[]') || []
      const boxWidth = boxRect[0]
      const boxHeight = boxRect[1]
      const sampleImage = images[0]
      images = new Array(count).fill(sampleImage)
      if (images.length > 0 && boxWidth && boxHeight) {
        const padding = 6
        // 每行展示的图片数量
        let imageCountPerLine = 2
        if (images.length >= 12) {
          imageCountPerLine = 4
        } else if (images.length >= 9) {
          imageCountPerLine = 3
        }
        const totalLineCount = Math.ceil(images.length / imageCountPerLine)
        // 图片总数是否超过了每行展示的图片数量
        const isNeedSplit = images.length >= imageCountPerLine
        const totalWidthPadding = isNeedSplit
          ? (imageCountPerLine - 1) * padding * 2
          : 0
        const totalHeightPadding = isNeedSplit
          ? (totalLineCount - 1) * padding * 2
          : 0
        // 每个图片的容器的宽度
        const imageBoxWidth = isNeedSplit
          ? (boxWidth - totalWidthPadding) / imageCountPerLine
          : boxWidth
        // 每个容器的高度
        const imageBoxHeight = isNeedSplit
          ? (boxHeight - totalHeightPadding) / totalLineCount
          : boxHeight
        // 计算的边长取最小的边
        const computedWidth = Math.min(...[imageBoxWidth, imageBoxHeight])
        // 计算每个图片距离box的位置
        // const computedLeftPerImageBox = imageBoxWidth - computedWidth
        // const computedTopPerImageBox = imageBoxHeight - computedWidth
        // 通过box的长宽和图片的长宽比，计算最终可渲染的box大小和绝对定位的位置
        return images.map((image: AIMessageImageData, index: number) => {
          const aspectRatio = b || image.aspectRatio || '1:1'
          const [aspectRatioWidth, aspectRatioHeight] = aspectRatio
            .split(':')
            .map(Number)
          // 如果是横向的图片，那么就以box的宽度为基准，否则以box的高度为基准
          const isHorizontal = aspectRatioWidth >= aspectRatioHeight
          const ratio = aspectRatioWidth / aspectRatioHeight
          const imageBoxWidth = isHorizontal
            ? computedWidth
            : computedWidth * ratio
          const imageBoxHeight = isHorizontal
            ? computedWidth / ratio
            : computedWidth
          // 根据行数和index计算top和left
          const line = Math.floor(index / imageCountPerLine)
          const lineIndex = index % imageCountPerLine
          const imageBoxTop = line * (computedWidth + padding * 2)
          const imageBoxLeft = lineIndex * (computedWidth + padding * 2)
          return {
            imageBoxWidth,
            imageBoxHeight,
            imageBoxTop,
            imageBoxLeft,
            image,
          }
        })
      } else {
        return []
      }
    } catch (e) {
      return []
    }
  }, [AIMessage.originalMessage?.content?.text, boxRect, count, b])
  const debounceUpdateBoxRect = useMemo(
    () =>
      debounce(() => {
        if (boxRef.current) {
          const { width, height } = boxRef.current.getBoundingClientRect()
          setBoxRect([width, height])
        }
      }, 50),
    [],
  )
  useEffect(() => {
    // 监听长宽的变化
    const resizeObserver = new ResizeObserver(() => {
      debounceUpdateBoxRect()
    })
    if (boxRef.current) {
      resizeObserver.observe(boxRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [boxRef])
  // 宋老师要求第一版本最简单实现
  return (
    <Stack
      ref={boxRef}
      mt={1}
      minHeight={'16px'}
      width={'60%'}
      minWidth={415}
      sx={{
        position: 'relative',
      }}
    >
      {renderDataList.map((renderData, index) => {
        const width = boxRef.current?.getBoundingClientRect().width || 415
        const height =
          width / artTextToAspectRatio(renderData?.image?.aspectRatio)
        return (
          <Box
            ref={boxRef}
            key={1}
            className={'maxai-ai-message__image__content__box'}
            sx={{
              position: 'relative',
              zIndex: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'auto',
              height: 'auto',
              overflow: 'hidden',
              borderRadius: '4px',
              '& > img': {
                width: '100%',
                height: '100%',
                border: '2px solid rgba(0,0,0,0)',
                boxSizing: 'border-box',
                borderRadius: '8px',
                transition: 'border .1s cubic-bezier(0.22, 0.61, 0.36, 1)',
                userSelect: 'none',
                overflow: 'hidden',
              },
            }}
          >
            <LazyLoadImage
              sx={{
                width: '100%',
              }}
              height={height}
              src={renderData.image?.url}
              alt={`Variation 1 of ${renderDataList.length}`}
            />
          </Box>
        )
      })}
    </Stack>
  )
  return (
    <Stack
      ref={boxRef}
      mt={1}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        paddingBottom: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          left: 200,
          width: '100%',
          height: '100%',
        }}
      >
        <DevContent>
          <Button
            onClick={() => {
              setCount(1)
            }}
          >
            Reset count
          </Button>
          <Button
            onClick={() => {
              setCount(count + 1)
            }}
          >
            Add count
          </Button>
          <Button
            onClick={() => {
              if (b === '1:1') {
                setB('3:4')
              } else if (b === '3:4') {
                setB('4:3')
              } else if (b === '4:3') {
                setB('9:16')
              } else if (b === '9:16') {
                setB('16:9')
              } else {
                setB('1:1')
              }
            }}
          >
            Change 比例
          </Button>
          <span>{b}</span>
        </DevContent>
      </Box>
      {renderDataList.map((renderData, index) => {
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              display: 'inline-flex',
              willChange: 'top, left, width, height, transition',
              top: renderData.imageBoxTop,
              left: renderData.imageBoxLeft,
              width: renderData.imageBoxWidth,
              height: renderData.imageBoxHeight,
              transition: `left 0.2s ease 0s, top 0.2s ease 0s, width 0.1s ease 0s, height 0.1s ease 0s`,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'auto',
                height: 'auto',
                overflow: 'hidden',
                borderRadius: '4px',
                '&:hover': {
                  '.maxai-ai-message__image__content__bottom-tool-bar': {
                    opacity: 1,
                  },
                  '& > img': {
                    border: `2px solid`,
                    borderColor: (t) =>
                      t.palette.mode === 'dark'
                        ? '#ffffff'
                        : t.palette.primary.main,
                  },
                },
                '& > img': {
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  border: '2px solid rgba(0,0,0,0)',
                  boxSizing: 'border-box',
                  borderRadius: '8px',
                  transition: 'border .1s cubic-bezier(0.22, 0.61, 0.36, 1)',
                  userSelect: 'none',
                  overflow: 'hidden',
                },
              }}
            >
              <Stack
                direction={'row'}
                className={'maxai-ai-message__image__content__bottom-tool-bar'}
                sx={{
                  width: '100%',
                  position: 'absolute',
                  bottom: 0,
                  opacity: 0,
                  height: 54,
                  p: 1,
                  transition: 'opacity .3s cubic-bezier(0.22, 0.61, 0.36, 1)',
                }}
              >
                <SidebarAIMessageImageContentDownloadButton
                  sx={{
                    bgcolor: 'rgb(38,38,38)',
                    '&:hover': {
                      bgcolor: 'rgb(68,68,68)',
                    },
                  }}
                  downloadUrl={
                    renderData.image?.downloadUrl || renderData.image.url
                  }
                />
              </Stack>
              <LazyLoadImage
                height={415}
                sx={{
                  width: '100%',
                }}
                src={renderData.image?.url}
                alt={`Variation ${index + 1} of ${renderDataList.length}`}
              />
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
export default SidebarAIMessageImageContent
