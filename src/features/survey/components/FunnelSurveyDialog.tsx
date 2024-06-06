import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { backdropClasses } from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Dialog, { dialogClasses } from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect } from 'react'

import FunnelSurveyContentRenderer from '@/features/survey/components/FunnelSurveyContentRenderer'
import useFunnelSurveyController from '@/features/survey/hooks/useFunnelSurveyController'
import useFunnelSurveyOpenTimer from '@/features/survey/hooks/useFunnelSurveyOpenTimer'
import { IFunnelSurveySceneType } from '@/features/survey/types'

interface IFunnelSurveyDialogProps {
  sceneType: IFunnelSurveySceneType
  sx?: SxProps
}

const FunnelSurveyDialog: FC<IFunnelSurveyDialogProps> = ({
  sceneType,
  sx,
}) => {
  const { open, closePopup: handleClose } = useFunnelSurveyController(sceneType)
  const [loaded, setLoaded] = React.useState(false)

  useFunnelSurveyOpenTimer(loaded, sceneType)

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <Dialog
      open={open}
      disableScrollLock={true}
      onClose={(e, reason) => {
        if (reason === 'backdropClick') return // 点击背景不关闭，防止用户看不到弹窗
        handleClose()
      }}
      slotProps={{
        backdrop: {
          onClick: () => null,
        },
      }}
      sx={{
        position: 'absolute',
        zIndex: 2147483647,
        [`.${backdropClasses.root}`]: {
          position: 'absolute',
        },
        [`.${dialogClasses.paper}`]: {
          maxWidth: 448,
          mx: 'auto',
          bgcolor: 'transparent',
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      }}
    >
      <Box id={`funnel_survey__${sceneType}`}>
        <IconButton
          data-testid="maxai-custom-modal-close-btn"
          onClick={handleClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'rgba(0,0,0,0.44)',
            zIndex: 1,
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
        <FunnelSurveyContentRenderer sx={sx} sceneType={sceneType} />
      </Box>
    </Dialog>
  )
}

export default FunnelSurveyDialog
