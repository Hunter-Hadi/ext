import { Button, Skeleton, Stack, Typography } from '@mui/material'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import {
  formatSecondsAsTimestamp,
  formatTimestampToSeconds,
} from '@/features/sidebar/utils/chatMessagesHelper'
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
  useEffect(() => {
    return () => {
      console.log('TEST bottom list unmount')
    }
  }, [])
  const transcriptLoadingsLength = useMemo(() => {
    if (transcriptList) {
      return transcriptList.filter((item) => item.status === 'loading').length
    } else {
      return 0
    }
  }, [transcriptList])
  const clickYoutubeJumpTimestamp = (time: string) => {
    try {
      if (time) {
        const seconds = time.includes(':')
          ? formatTimestampToSeconds(time)
          : parseInt(time, 10)

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
          window.scrollTo({ top: 0, behavior: 'smooth' })
          if (typeof seconds === 'number') {
            video.play()
            setTimeout(() => {
              video.currentTime = seconds
            }, waitingTime)
          }
        }
      }
    } catch (e) {
      console.log('clickLinkUrl error', e)
    }
  }
  const decodeHtmlEntity = (str: string) => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = str.trim().replace(/\n/g, '')
    return textarea.value
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
        if (transcriptItem.text || transcriptItem.status === 'error') {
          return (
            <Stack key={transcriptItem.start}>
              <Stack
                direction='row'
                justifyContent='flex-start'
                alignItems='flex-start'
                spacing={1}
                key={index}
                sx={{ marginTop: '15px' }}
              >
                <Button
                  sx={{
                    padding: '0 5px!important',
                    minWidth: '30px',
                  }}
                  variant='contained'
                  size='small'
                  onClick={() =>
                    clickYoutubeJumpTimestamp(transcriptItem.start)
                  }
                >
                  {formatSecondsAsTimestamp(transcriptItem.start)}
                </Button>

                {transcriptItem.status !== 'error' && (
                  <Stack
                    sx={{ flex: 1, cursor: 'pointer' }}
                    onClick={() =>
                      transcriptItem.id && onSetOpenIdsList(transcriptItem.id)
                    }
                  >
                    <Typography fontSize={16} color='text.primary'>
                      {decodeHtmlEntity(transcriptItem.text || '')}
                    </Typography>
                    {transcriptItem?.children &&
                      transcriptItem?.children.length > 0 && (
                        <Stack direction='row' alignItems='center'>
                          <Typography fontSize={15} color='text.secondary'>
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
                              icon='KeyboardArrowDown'
                            />
                          ) : (
                            <ContextMenuIcon
                              sx={{
                                color: 'rgba(0, 0, 0, 0.6)',
                              }}
                              size={25}
                              icon='KeyboardArrowDown'
                            />
                          )}
                        </Stack>
                      )}
                  </Stack>
                )}
                {transcriptItem.status === 'error' && (
                  <Typography
                    fontSize={16}
                    color='error'
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
              </Stack>
              {transcriptItem?.children &&
                openIdsList[transcriptItem.id || ''] &&
                transcriptItem?.children?.map((transcriptChildren) => (
                  <Stack
                    direction='row'
                    justifyContent='flex-start'
                    alignItems='flex-start'
                    spacing={1}
                    key={transcriptChildren.id}
                    sx={{ marginTop: '5px', marginLeft: '10px' }}
                  >
                    <Button
                      sx={{
                        padding: '0px!important',
                        minWidth: '30px',
                      }}
                      size='small'
                      onClick={() =>
                        clickYoutubeJumpTimestamp(transcriptChildren.start)
                      }
                    >
                      {formatSecondsAsTimestamp(transcriptChildren.start)}
                    </Button>
                    <Typography
                      fontSize={15}
                      color='text.secondary'
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
            color='text.primary'
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
      {loading &&
        transcriptLoadingsLength > 0 &&
        Array.from(
          {
            length:
              transcriptLoadingsLength >= 8 ? 8 : transcriptLoadingsLength,
          },
          (_, index) => (
            <Skeleton
              key={index}
              variant='rounded'
              width='100%'
              height={15}
              sx={{ marginTop: '5px' }}
            />
          ),
        )}
      {/* 防止actions上的异常错误导致显示空白，比如transcriptList为undefined */}
      {!transcriptList && (
        <Typography
          fontSize={16}
          color='error'
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
