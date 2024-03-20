import { Button, Stack, Typography } from '@mui/material'
import { FC, useEffect } from 'react'
import React from 'react'

import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'

interface ITranscriptView {
  transcriptList: TranscriptResponse[]
}
const TranscriptView: FC<ITranscriptView> = ({ transcriptList }) => {
  useEffect(() => {
    console.log('simply transcriptListData', transcriptList)
  }, [transcriptList])
  const clickLinkUrl = (time: string) => {
    if (time) {
      try {
        const video = document.querySelector(
          '#container video',
        ) as HTMLVideoElement
        if (video) {
          const timeNum = parseInt(time, 10)
          if (typeof timeNum === 'number') {
            video.currentTime = timeNum
          }
        }
      } catch (e) {
        console.log('clickLinkUrl error', e)
      }
    }
  }
  const formatSecondsAsTimestamp = (seconds: string) => {
    // 将字符串转换为浮点数并取整
    const totalSeconds = Math.round(parseFloat(seconds))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60)
    const sec = totalSeconds - hours * 3600 - minutes * 60

    // 使用padStart在个位数前添加0，格式化字符串为两位数
    const hoursString = hours.toString().padStart(2, '0')
    const minutesString = minutes.toString().padStart(2, '0')
    const secondsString = sec.toString().padStart(2, '0')
    if (hoursString !== '00') {
      return `${hoursString}:${minutesString}:${secondsString}`
    } else {
      return `${minutesString}:${secondsString}`
    }
  }
  return (
    <div>
      {transcriptList &&
        Array.isArray(transcriptList) &&
        transcriptList.map((transcriptItem, index) => (
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={1}
            key={index}
            sx={{ marginTop: '15px' }}
          >
            <Button
              sx={{
                padding: '0 5px!important',
                minWidth: '30px',
              }}
              variant="contained"
              size="small"
              onClick={() => clickLinkUrl(transcriptItem.start)}
            >
              {formatSecondsAsTimestamp(transcriptItem.start)}
            </Button>
            <Typography
              fontSize={16}
              color="text.primary"
              sx={{
                p: 0,
                flex: 1,
              }}
            >
              {(transcriptItem.text || '').trim().replace(/\n/g, '')}
            </Typography>
          </Stack>
        ))}
    </div>
  )
}
export default TranscriptView
