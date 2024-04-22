import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import CustomModal from '@/features/common/components/CustomModal'
import useVideoPopupController from '@/features/video_popup/hooks/useVideoPopupController'

interface IVideoPopupProps {
  videoWidth?: string | number
  videoHeight?: string | number
  onClose?: () => void
  sx?: SxProps
}

const VIDEO_POPUP_CONTAINER_ID = 'video-popup-container'

const GlobalVideoPopup: FC<IVideoPopupProps> = (props) => {
  const { videoWidth, videoHeight, onClose, sx } = props
  const { open, videoSrc, closeVideoPopup } = useVideoPopupController()

  const onModalClose = () => {
    closeVideoPopup()
    onClose && onClose()
  }

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
        <Box
          id={VIDEO_POPUP_CONTAINER_ID}
          width={videoWidth}
          height={videoHeight}
        >
          <YoutubePlayerBox borderRadius={4} youtubeLink={videoSrc} />
        </Box>
      </Stack>
    </CustomModal>
  )
}

export default GlobalVideoPopup
