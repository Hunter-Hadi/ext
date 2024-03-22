import { Button, Skeleton, Stack, Typography } from '@mui/material'
import { FC, useCallback, useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import globalSnackbar from '@/utils/globalSnackbar'

interface ITranscriptView {
  transcriptList: TranscriptResponse[]
  loading: boolean
}
const TranscriptView: FC<ITranscriptView> = ({ transcriptList, loading }) => {
  const { t } = useTranslation(['client'])
  const [openIdsList, setOpenIdsList] = useState<{ [key in string]: boolean }>(
    {},
  )
  useEffect(() => {
    console.log('simply transcriptList ------', transcriptList, loading)
  }, [transcriptList, loading])
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
  const onSetIdsList = (id: string) => {
    openIdsList[id] = !openIdsList[id]
    setOpenIdsList({ ...openIdsList })
  }
  const TranscriptListView = useCallback(() => {
    return (
      transcriptList &&
      Array.isArray(transcriptList) &&
      transcriptList.map((transcriptItem, index) => {
        if (transcriptItem.status === 'loading' && !transcriptItem.text) {
          if (loading) {
            return (
              <Skeleton
                variant="rounded"
                width="100%"
                height={80}
                sx={{ marginTop: '15px' }}
              />
            )
          } else {
            return <></>
          }
        } else {
          return (
            <Stack key={transcriptItem.start}>
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

                <Stack sx={{ flex: 1 }}>
                  <Typography fontSize={16} color="text.primary">
                    {decodeHtmlEntity(transcriptItem.text || '')}
                  </Typography>
                  {transcriptItem?.children && (
                    <Stack
                      onClick={() =>
                        transcriptItem.id && onSetIdsList(transcriptItem.id)
                      }
                      direction="row"
                      sx={{ cursor: 'pointer' }}
                      spacing={2}
                    >
                      <Typography fontSize={15} color="text.secondary">
                        {openIdsList[transcriptItem.id || '']
                          ? 'Collapse'
                          : 'Expand'}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
              {transcriptItem?.children &&
                openIdsList[transcriptItem.id || ''] &&
                transcriptItem?.children?.map((transcriptChildren) => (
                  <Stack
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    spacing={1}
                    key={transcriptChildren.id}
                    sx={{ marginTop: '5px', marginLeft: '10px' }}
                  >
                    <Button
                      sx={{
                        padding: '0px!important',
                        minWidth: '30px',
                      }}
                      size="small"
                      onClick={() => clickLinkUrl(transcriptChildren.start)}
                    >
                      {formatSecondsAsTimestamp(transcriptChildren.start)}
                    </Button>
                    <Typography
                      fontSize={15}
                      color="text.secondary"
                      sx={{
                        p: 0,
                        flex: 1,
                      }}
                    >
                      {decodeHtmlEntity(transcriptChildren.text || '')}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          )
        }
      })
    )
  }, [transcriptList, openIdsList, loading])
  return (
    <div>
      {(!transcriptList ||
        (transcriptList &&
          Array.isArray(transcriptList) &&
          transcriptList.length === 0)) && (
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
      {TranscriptListView()}
    </div>
  )
}
export default TranscriptView
