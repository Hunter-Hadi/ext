import { backdropClasses } from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Dialog, { dialogClasses } from '@mui/material/Dialog'
import React, { useEffect, useState } from 'react'

import { setChromeExtensionOnBoardingData } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import SidebarSurveyContent from '@/features/sidebar/components/SidebarChatBox/SidebarSurveyDialog/SidebarSurveyContent'
import { currentSurveyKey } from '@/features/survey/constants'
import useSurveyStatus from '@/features/survey/hooks/useSurveyStatus'

const SidebarSurveyDialog = () => {
  // 当前渲染 survey key
  const {
    canShowSurvey,
    alreadyPoppedSurveyModal,
    loaded: surveyStatusLoaded,
  } = useSurveyStatus()

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    // 可以看到 survey 并且没有弹过 survey modal
    // 才弹 survey modal
    if (surveyStatusLoaded && canShowSurvey && !alreadyPoppedSurveyModal) {
      // 加个延迟让用户看到聊天框
      setTimeout(async () => {
        await setChromeExtensionOnBoardingData(
          'ON_BOARDING_EXTENSION_SURVEY_DIALOG_ALERT',
          true,
        )

        setOpen(true)
      }, 1500)
    }
  }, [canShowSurvey, alreadyPoppedSurveyModal, surveyStatusLoaded])

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
          width: 'calc(100% - 32px)',
          mx: 2,
        },
      }}
    >
      <Box
        sx={{
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <SidebarSurveyContent
          surveyKey={currentSurveyKey}
          handleCloseClick={handleClose}
        />
      </Box>
    </Dialog>
  )
}

export default SidebarSurveyDialog
