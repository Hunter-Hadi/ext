import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import { backdropClasses } from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { dialogClasses } from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { APP_VERSION } from '@/constants'
import useUpdateModalABTester from '@/features/abTester/hooks/useUpdateModalABTester'
import { ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY } from '@/features/activity/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ResponsiveImage from '@/features/common/components/ResponsiveImage'
import useBrowserAgent from '@/features/common/hooks/useBrowserAgent'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import useSurveyFilledOutStatus from '@/features/survey/hooks/useSurveyFilledOutStatus'
dayjs.extend(utc)

const CTA_BUTTON_LINK = `https://app.maxai.me/pricing`

const SidebarPromotionDialog = () => {
  const { t } = useTranslation(['client'])
  const { browserAgent } = useBrowserAgent()
  const { userInfo, isPayingUser } = useUserInfo()

  const { alreadyFilledOutSurvey: surveyCancelCompletedFilledOut } =
    useSurveyFilledOutStatus('funnel_survey__survey_cancel_completed')

  const [open, setOpen] = useState(false)

  const { updateVariant, updateVariantTemplate } = useUpdateModalABTester()

  const updateVariantRef = useRef(updateVariant)
  updateVariantRef.current = updateVariant

  const handleClick = () => {
    mixpanelTrack('update_modal_clicked', {
      testFeature: 'extensionUpdateModal',
      testVersion: `1-${updateVariant}`,
    })
    handleClose()
    window.open(CTA_BUTTON_LINK)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    const createAt = userInfo?.created_at

    // 没登录时不弹窗
    if (userInfo === null || !createAt) {
      return
    }

    // edge 浏览器不弹窗，在 background updated 时会弹窗
    if (browserAgent === 'Edge') {
      return
    }

    // 不是免费用户不弹窗
    if (isPayingUser) {
      return
    }

    // 注册时间小于三天不弹窗
    const timeLimit = new Date().getTime() - 3 * 24 * 60 * 60 * 1000
    if (new Date(createAt).getTime() > timeLimit) {
      return
    }

    // subscription_cancelled_at 存在，并且没有填写过 survey_cancel_completed survey
    if (userInfo.subscription_cancelled_at && !surveyCancelCompletedFilledOut) {
      const cancelledAt = dayjs.utc(userInfo.subscription_cancelled_at)
      const now = dayjs.utc()
      if (now.diff(cancelledAt, 'day') < 30) {
        // 不显示 SidebarPromotionDialog， 因为这时候需要显示 survey_cancel_completed survey dialog
        return
      }
    }

    getChromeExtensionOnBoardingData().then((onBoardingData) => {
      // 弹过了，不弹窗
      if (
        onBoardingData[
          ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY
        ]
      ) {
        return
      }

      // if (!onBoardingData.ON_BOARDING_MAXAI_3_0) {
      //   // maxai 3.0 的 onboarding tour，还没有结束，不弹窗
      //   return
      // }

      // 弹窗
      // 加个延迟让用户看到聊天框
      setTimeout(async () => {
        await setChromeExtensionOnBoardingData(
          ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY,
          true,
        )

        setOpen(true)
        mixpanelTrack('update_modal_showed', {
          testFeature: 'extensionUpdateModal',
          testVersion: `1-${updateVariantRef.current}`,
        })
      }, 1500)
    })
  }, [browserAgent, userInfo, isPayingUser])

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
          borderRadius: 2,
        },
      }}
    >
      <Stack
        sx={{
          maxHeight: 'calc(100vh - 100px)',
          p: 2,
          gap: 2,
          textAlign: 'left',
        }}
      >
        {/* title */}
        <Stack direction={'row'} spacing={1} alignItems='center' flexShrink={0}>
          <Typography
            fontSize={16}
            color='text.primary'
            flex={1}
            fontWeight={500}
          >
            {t('sidebar__promotion_dialog__title', {
              VERSION: APP_VERSION,
            })}
          </Typography>

          <IconButton onClick={handleClose}>
            <CloseOutlinedIcon sx={{ fontSize: 24, color: 'text.primary' }} />
          </IconButton>
        </Stack>
        {/* content */}
        <Stack
          height={0}
          flex={1}
          sx={{
            overflowY: 'auto',
          }}
        >
          <ResponsiveImage
            src={updateVariantTemplate.image}
            width={832}
            height={468}
            onClick={handleClick}
            sx={{
              cursor: 'pointer',
            }}
          />

          <Stack py={2} spacing={1.5}>
            <Typography
              fontSize={18}
              color='text.primary'
              flex={1}
              fontWeight={800}
            >
              {updateVariantTemplate.title(t)}
            </Typography>

            <Stack px={1} spacing={1.5}>
              {updateVariantTemplate
                .descriptions(t)
                .map((descriptionItem, index) => (
                  <Stack
                    key={index}
                    direction='row'
                    sx={{
                      position: 'relative',
                      pl: 1.5,
                    }}
                  >
                    <Box
                      width={4}
                      height={4}
                      flexShrink={0}
                      borderRadius={'50%'}
                      bgcolor='text.primary'
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 0,
                      }}
                    />
                    <Typography
                      fontSize={16}
                      lineHeight={1.5}
                      color={'text.secondary'}
                      sx={{
                        '& > b': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {descriptionItem.title && (
                        <b>{descriptionItem.title}: </b>
                      )}
                      {descriptionItem.description}
                    </Typography>
                  </Stack>
                ))}
            </Stack>
          </Stack>
        </Stack>
        {/* cta button */}
        <Box position='relative'>
          <Button
            variant='contained'
            fullWidth
            startIcon={<ElectricBoltIcon sx={{ color: '#FFCB45' }} />}
            sx={{
              fontSize: 16,
              px: 2,
              py: 1.5,
              borderRadius: 2,
            }}
            onClick={handleClick}
          >
            {t('sidebar__promotion_dialog__cta_button')}
          </Button>
          <Typography
            fontSize={14}
            mt={1}
            color='text.secondary'
            textAlign='center'
          >
            {t('sidebar__promotion_dialog__footer_tips')}
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              right: 10,
              top: 0,
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 126, 53, 1)',
              color: '#fff',
              borderRadius: 2,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography fontSize={16} fontWeight={500} lineHeight={1}>
              {t('client:sidebar__promotion_dialog__discount__title')}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Dialog>
  )
}

export default SidebarPromotionDialog
