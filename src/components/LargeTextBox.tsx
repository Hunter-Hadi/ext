import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useEffect, useMemo, useRef } from 'react'
import { VariableSizeList } from 'react-window'

import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
const CHUNK_SIZE = 1000

interface LargeTextBoxProps {
  text: string
  chunkSize?: number
  sx?: SxProps
  fontSx?: SxProps
}

const LargeTextBox: React.FC<LargeTextBoxProps> = (props) => {
  const { text, chunkSize = CHUNK_SIZE, sx, fontSx } = props
  const rowHeights = useRef<{
    [key: number]: number
  }>({})
  const listRef = useRef<VariableSizeList | null>(null)
  const textOfChunks = useMemo(() => {
    const chunks = []
    let start = 0
    while (start < text.length) {
      const end = start + chunkSize
      let chunk = text.slice(start, end)
      // 找到下一个换行符
      const endIndex = text.slice(end).indexOf('\n')
      if (endIndex === -1) {
        // 如果没找到换行符，就说明从这里到结尾都是一个 chunk
        chunks.push(text.slice(start))
        break
      } else {
        // 如果找到了换行符，就说明这个 chunk 到换行符之间是一个完整的 chunk
        chunk += text.slice(end, end + endIndex)
        // 更新 start, +1 是为了跳过换行符
        start = end + endIndex + 1
        chunks.push(chunk)
      }
    }
    console.log('LargeTextBox', chunks)
    return chunks
  }, [text, chunkSize])
  const setRowHeight = (index: number, height: number) => {
    rowHeights.current[index] = height
    if (listRef.current) {
      listRef.current.resetAfterIndex(index)
    }
  }
  const RenderRow = ({
    index,
    style,
  }: {
    index: number
    style: React.CSSProperties
  }) => {
    const rowRef = useRef<HTMLElement | null>(null)
    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight)
      }
    }, [index])
    return (
      <Box key={index} sx={style} component={'div'}>
        <Typography
          component={'p'}
          ref={(el) => {
            rowRef.current = el as HTMLElement
          }}
          sx={fontSx}
        >
          {textOfChunks[index]}
        </Typography>
      </Box>
    )
  }
  return (
    <Stack
      sx={{
        width: '100%',
        height: 0,
        flex: 1,
        position: 'relative',
        ...sx,
      }}
    >
      <CopyTooltipIconButton
        sx={{
          position: 'absolute',
          right: 0,
          top: -32,
        }}
        title={''}
        copyText={text}
      />
      <VariableSizeList
        height={0}
        style={{
          flex: 1,
        }}
        className={'large-text-box'}
        ref={listRef}
        itemCount={textOfChunks.length}
        itemSize={(index: number) => {
          return rowHeights.current[index] || 50
        }}
        width={'100%'}
        itemData={textOfChunks}
      >
        {RenderRow}
      </VariableSizeList>
    </Stack>
  )
}

export default LargeTextBox
