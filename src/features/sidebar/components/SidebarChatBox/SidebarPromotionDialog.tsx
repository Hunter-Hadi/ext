import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { backdropClasses } from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog, { dialogClasses } from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { APP_VERSION } from '@/constants'
import { useUserInfo } from '@/features/chatgpt'
import ResponsiveImage from '@/features/common/components/ResponsiveImage'
import useBrowserAgent from '@/features/common/hooks/useBrowserAgent'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const SidebarPromotionDialog = () => {
  const { t } = useTranslation(['client'])
  const { browserAgent } = useBrowserAgent()
  const { userInfo, currentUserPlan } = useUserInfo()

  const [open, setOpen] = React.useState(false)

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
    if (currentUserPlan.name === 'pro' || currentUserPlan.name === 'elite') {
      return
    }

    // 注册时间小于三天不弹窗
    const timeLimit = new Date().getTime() - 3 * 24 * 60 * 60 * 1000
    if (new Date(createAt).getTime() > timeLimit) {
      return
    }

    getChromeExtensionOnBoardingData().then((onBoardingData) => {
      // 弹过了，不弹窗
      if (onBoardingData.ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG) {
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
          'ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG',
          true,
        )

        setOpen(true)
      }, 1500)
    })
  }, [browserAgent, userInfo, currentUserPlan])

  const promotionDescription = useMemo(() => {
    return [
      {
        title: t('sidebar__promotion_dialog__content_item1__title'),
        description: t('sidebar__promotion_dialog__content_item1__description'),
      },
      {
        title: t('sidebar__promotion_dialog__content_item2__title'),
        description: t('sidebar__promotion_dialog__content_item2__description'),
      },
      {
        title: t('sidebar__promotion_dialog__content_item3__title'),
        description: t('sidebar__promotion_dialog__content_item3__description'),
      },
      {
        title: t('sidebar__promotion_dialog__content_item4__title'),
        description: t('sidebar__promotion_dialog__content_item4__description'),
      },
      {
        title: t('sidebar__promotion_dialog__content_item5__title'),
        description: t('sidebar__promotion_dialog__content_item5__description'),
      },
      {
        title: t('sidebar__promotion_dialog__content_item6__title'),
        description: t('sidebar__promotion_dialog__content_item6__description'),
      },
    ]
  }, [t])

  return (
    <Dialog
      open={open}
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
      <Stack>
        {/* title */}
        <Stack
          direction={'row'}
          spacing={1}
          px={2}
          py={2.5}
          alignItems="center"
        >
          <Typography
            fontSize={16}
            color="text.primary"
            flex={1}
            fontWeight={500}
          >
            {t('sidebar__promotion_dialog__title', {
              VERSION: APP_VERSION,
            })}
          </Typography>

          <IconButton onClick={handleClose}>
            <CloseOutlinedIcon sx={{ fontSize: 20, color: 'text.primary' }} />
          </IconButton>
        </Stack>
        {/* content */}
        <Stack px={2}>
          <ResponsiveImage
            src={getChromeExtensionAssetsURL(
              '/images/activity/promotion-dialog-banner.png',
            )}
            width={832}
            height={468}
          />

          <Stack py={2} spacing={1}>
            {promotionDescription.map((descriptionItem) => (
              <Stack key={descriptionItem.title} spacing={1} direction="row">
                <Box
                  mt={1}
                  width={4}
                  height={4}
                  flexShrink={0}
                  borderRadius={'50%'}
                  bgcolor="text.primary"
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
                  <b>{descriptionItem.title}</b>: {descriptionItem.description}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        {/* cta button */}
        <Box p={2}>
          <Button
            variant="contained"
            fullWidth
            href={`https://app.maxai.me/anniversary2024`}
            target={'_blank'}
            sx={{
              fontSize: 16,
              px: 2,
              py: 1.5,
            }}
            onClick={handleClose}
          >
            {t('sidebar__promotion_dialog__cta_button')}
          </Button>
        </Box>
      </Stack>
    </Dialog>
  )
}

export default SidebarPromotionDialog