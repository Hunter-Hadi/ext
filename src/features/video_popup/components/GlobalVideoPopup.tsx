import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useState } from 'react'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import CustomModal from '@/features/common/components/CustomModal'
import { MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID } from '@/features/video_popup/constant'
import { closeGlobalVideoPopup } from '@/features/video_popup/utils'

interface IVideoPopupProps {
  videoWidth?: string | number
  videoHeight?: string | number
  onClose?: () => void
  sx?: SxProps
}

const GlobalVideoPopup: FC<IVideoPopupProps> = (props) => {
  const { videoWidth, videoHeight, onClose, sx } = props
  const [videoSrc, setVideoSrc] = useState('')
  const [open, setOpen] = useState(false)

  useCreateClientMessageListener(async (event, data) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenSwitchVideoPopup': {
        const { videoSrc, open } = data
        setVideoSrc(videoSrc)
        setOpen(open)
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      default:
        break
    }
    return undefined
  })

  const onModalClose = () => {
    closeGlobalVideoPopup()
    onClose && onClose()
  }

  useEffect(() => {
    const videoPopupContainer = document.getElementById(
      MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID,
    )
    if (videoPopupContainer) {
      videoPopupContainer.setAttribute('data-status', open ? 'open' : 'hide')
    }
  }, [open])

  if (open && videoSrc) {
    return (
      <CustomModal
        show={open}
        onClose={onModalClose}
        width={videoWidth}
        height={'auto'}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          my: 0,
          minHeight: 'calc(65vw * 9 / 16)',
          bgcolor: 'transparent',
          maxWidth: 'calc(80vh * 16 / 9)',
          boxShadow: 'none',
          borderRadius: 2,

          ...sx,
        }}
      >
        <Stack
          height={'100%'}
          justifyContent="center"
          sx={{
            height: 'auto',
          }}
        >
          <Box width={videoWidth} height={videoHeight}>
            <YoutubePlayerBox borderRadius={4} youtubeLink={videoSrc} />
          </Box>
        </Stack>
      </CustomModal>
    )
  }

  return null
}

export default GlobalVideoPopup
