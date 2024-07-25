import { Button } from '@mui/material'
import { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { formatTimestampToSeconds } from '@/features/sidebar/utils/chatMessagesHelper'
import globalSnackbar from '@/utils/globalSnackbar'

interface IYoutubeTimeButton {
  time: string // [01:33:33] [24:33]
}

const YoutubeTimeButton: FC<IYoutubeTimeButton> = ({ time }) => {
  const { t } = useTranslation(['client'])

  const clickYoutubeJumpTimestamp = () => {
    if (!time) return
    try {
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
    } catch (e) {
      console.log('clickLinkUrl error', e)
    }
  }

  return (
    <Button
      sx={{
        minWidth: '30px',
        fontWeight: 'normal',
        color: (theme) => `${theme.palette.primary.main}!important`,
      }}
      variant='text'
      size='small'
      onClick={clickYoutubeJumpTimestamp}
    >
      {time}
    </Button>
  )
}
export default YoutubeTimeButton
