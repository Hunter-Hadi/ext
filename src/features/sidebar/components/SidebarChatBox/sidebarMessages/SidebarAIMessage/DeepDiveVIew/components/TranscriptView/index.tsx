import { Button, Stack, Typography } from '@mui/material'
import { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import globalSnackbar from '@/utils/globalSnackbar'

interface ITranscriptView {
  transcriptList: TranscriptResponse[]
}
const TranscriptView: FC<ITranscriptView> = ({ transcriptList }) => {
  const { t } = useTranslation(['client'])

  const clickLinkUrl = (time: string) => {
    if (time) {
      try {
        const isAdvertisingTime = document.querySelector(
          '#container .ytp-ad-text.ytp-ad-preview-text-modern',
        )
        if (
          isAdvertisingTime &&
          window.getComputedStyle(isAdvertisingTime).display !== 'none'
        ) {
          //在看广告无法跳过，请稍等
          globalSnackbar.warning(
            t(
              'client:sidebar__summary__nav__youtube_summary__transcript__current__advertising',
            ),
            {
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            },
          )
          return
        }
        let waitingTime = 10
        const isSkipTime = document.querySelector(
          '#container .ytp-ad-skip-button-modern.ytp-button',
        ) as HTMLButtonElement
        if (
          isSkipTime &&
          window.getComputedStyle(isSkipTime).display !== 'none'
        ) {
          waitingTime = 200
          //跳过广告处理
          isSkipTime.click()
        }
        const video = document.querySelector(
          '#container video',
        ) as HTMLVideoElement
        if (video) {
          const timeNum = parseInt(time, 10)
          if (typeof timeNum === 'number') {
            video.play()
            setTimeout(() => {
              video.currentTime = timeNum
            }, waitingTime)
          }
        }
      } catch (e) {
        console.log('clickLinkUrl error', e)
      }
    }
  }
  const decodeHtmlEntity = (str: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = str.trim().replace(/\n/g, '')
    return textarea.value
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
        transcriptList.length === 0 && (
          <Typography
            fontSize={16}
            color="text.primary"
            sx={{
              p: 0,
              flex: 1,
            }}
          >
            Unable to generate video without subtitles.
          </Typography>
        )}
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
              {decodeHtmlEntity(transcriptItem.text || '')}
            </Typography>
          </Stack>
        ))}
    </div>
  )
}
export default TranscriptView
