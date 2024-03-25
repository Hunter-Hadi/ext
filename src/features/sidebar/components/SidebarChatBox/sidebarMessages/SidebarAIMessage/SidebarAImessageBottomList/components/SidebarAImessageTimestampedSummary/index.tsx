import { Button, Skeleton, Stack, Typography } from '@mui/material'
import { FC, useCallback, useMemo, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import globalSnackbar from '@/utils/globalSnackbar'

interface ISidebarAImessageTimestampedSummary {
  transcriptList: TranscriptResponse[]
  loading: boolean
}
const SidebarAImessageTimestampedSummary: FC<
  ISidebarAImessageTimestampedSummary
> = ({ transcriptList, loading }) => {
  const { t } = useTranslation(['client'])
  const [openIdsList, setOpenIdsList] = useState<{ [key in string]: boolean }>(
    {},
  )
  const transcriptLoadingsLength = useMemo(() => {
    return transcriptList.filter((item) => item.status === 'loading').length
  }, [transcriptList])
  const transcriptStatusIsError = useMemo(() => {
    return transcriptList.filter((item) => item.status === 'error').length > 0
  }, [transcriptList])
  const clickYoutubeJumpTimestamp = (time: string) => {
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
  const onSetOpenIdsList = (id: string) => {
    openIdsList[id] = !openIdsList[id]
    setOpenIdsList({ ...openIdsList })
  }
  const TranscriptListView = useCallback(() => {
    return (
      transcriptList &&
      Array.isArray(transcriptList) &&
      transcriptList.map((transcriptItem, index) => {
        if (transcriptItem.status !== 'loading' && transcriptItem.text) {
          return (
            <Stack key={transcriptItem.start}>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={1}
                key={index}
                sx={{ marginTop: '15px' }}
                onClick={() =>
                  transcriptItem.id && onSetOpenIdsList(transcriptItem.id)
                }
              >
                <Button
                  sx={{
                    padding: '0 5px!important',
                    minWidth: '30px',
                  }}
                  variant="contained"
                  size="small"
                  onClick={() =>
                    clickYoutubeJumpTimestamp(transcriptItem.start)
                  }
                >
                  {formatSecondsAsTimestamp(transcriptItem.start)}
                </Button>

                <Stack sx={{ flex: 1, cursor: 'pointer' }}>
                  <Typography fontSize={16} color="text.primary">
                    {decodeHtmlEntity(transcriptItem.text || '')}
                  </Typography>
                  {transcriptItem?.children && (
                    <Stack direction="row" alignItems="center">
                      <Typography fontSize={15} color="text.secondary">
                        {openIdsList[transcriptItem.id || '']
                          ? 'Collapse'
                          : 'Expand'}
                      </Typography>
                      {openIdsList[transcriptItem.id || ''] ? (
                        <ContextMenuIcon
                          sx={{
                            transform: 'rotate(180deg)',
                            color: 'rgba(0, 0, 0, 0.6)',
                          }}
                          size={25}
                          icon="KeyboardArrowDown"
                        />
                      ) : (
                        <ContextMenuIcon
                          sx={{
                            color: 'rgba(0, 0, 0, 0.6)',
                          }}
                          size={25}
                          icon="KeyboardArrowDown"
                        />
                      )}
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
                      onClick={() =>
                        clickYoutubeJumpTimestamp(transcriptChildren.start)
                      }
                    >
                      {formatSecondsAsTimestamp(transcriptChildren.start)}
                    </Button>
                    <Typography
                      fontSize={15}
                      color="text.secondary"
                      onClick={() =>
                        transcriptItem.id && onSetOpenIdsList(transcriptItem.id)
                      }
                      sx={{
                        p: 0,
                        flex: 1,
                        cursor: 'pointer',
                      }}
                    >
                      {decodeHtmlEntity(transcriptChildren.text || '')}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          )
        } else {
          return <></>
        }
      })
    )
  }, [transcriptList, openIdsList, loading])
  //Array.isArray 是因为transcriptList 数据有可能是字符串或者数组，并且transcript第一版是字符串输出。
  //Array.isArray也是为了保证数据的正确性
  return (
    <div>
      {!transcriptList ||
        !Array.isArray(transcriptList) ||
        (transcriptList.length === 0 && (
          <Typography
            fontSize={16}
            color="text.primary"
            sx={{
              p: 0,
              flex: 1,
            }}
          >
            {t(
              'client:sidebar__summary__nav__youtube_summary__not_have__transcript',
            )}
          </Typography>
        ))}
      {TranscriptListView()}
      {!transcriptStatusIsError &&
        transcriptLoadingsLength > 0 &&
        Array.from(
          {
            length:
              transcriptLoadingsLength >= 10 ? 10 : transcriptLoadingsLength,
          },
          (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              width="100%"
              height={15}
              sx={{ marginTop: '2px' }}
            />
          ),
        )}
      {transcriptStatusIsError && (
        <Typography
          fontSize={16}
          color="error"
          sx={{
            p: 0,
            flex: 1,
          }}
        >
          {t(
            'client:sidebar__summary__nav__youtube_summary__transcript_timestamped_error',
          )}
        </Typography>
      )}
    </div>
  )
}
export default SidebarAImessageTimestampedSummary
