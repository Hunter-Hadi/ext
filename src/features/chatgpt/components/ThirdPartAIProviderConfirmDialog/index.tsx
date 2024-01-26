import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { CHROME_EXTENSION_MAIL_TO } from '@/constants'
import ThirdPartyAIProviderModelSelectorCard from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog/ThirdPartyAIProviderModelSelectorCard'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'

import ThirdPartyAIProviderRecommendations from './ThirdPartyAIProviderRecommendations'

interface ThirdPartAIProviderConfirmDialogProps {
  sx?: SxProps
}

const ThirdPartAIProviderConfirmDialog: FC<ThirdPartAIProviderConfirmDialogProps> = ({
  sx,
}) => {
  const { t } = useTranslation(['client', 'common'])
  const [dialogState, setDialogState] = useRecoilState(
    ThirdPartyAIProviderConfirmDialogState,
  )

  const { open } = dialogState

  const handleClose = () => {
    setDialogState({
      open: false,
    })
  }

  useEffect(() => {
    // 如果 dialog 已经打开， 则监听 Esc 按键，关闭 dialog
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <Box
      component={'div'}
      sx={{
        position: 'relative',
        borderRadius: '4px',
        border: '1px solid #EBEBEB',
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
        width: 448,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        maxHeight: '823px',
        ...sx,
      }}
    >
      {/* close button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
        }}
        onClick={handleClose}
      >
        <CloseOutlinedIcon
          sx={{
            fontSize: 24,
          }}
        />
      </IconButton>
      <Stack
        p={2}
        spacing={2}
        sx={{
          flexShrink: 0,
        }}
      >
        <Typography
          fontSize={20}
          fontWeight={700}
          color={'text.primary'}
          lineHeight={1.4}
          pr={4}
          textAlign={'left'}
        >
          {t('client:provider__third_party_confirm_dialog__title')}
        </Typography>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.primary'}
          lineHeight={1.5}
          textAlign={'left'}
        >
          {t('client:provider__third_party_confirm_dialog__sub_title')}
        </Typography>
      </Stack>
      <Stack
        spacing={2}
        sx={{
          padding: '0 16px 16px 16px',
          flex: 1,
          height: 0,
          mb: '200px',
          overflowY: 'auto',
        }}
      >
        <Stack direction={'row'} spacing={1} alignItems="center">
          <NotificationImportantOutlinedIcon
            sx={{
              color: 'rgba(219, 68, 55, 1)',
              fontSize: 24,
            }}
          />

          <Typography
            fontSize={16}
            fontWeight={500}
            color={'text.primary'}
            lineHeight={1.5}
          >
            {t('client:provider__third_party_confirm_dialog__important__title')}
          </Typography>
        </Stack>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.secondary'}
          lineHeight={1.5}
          mt={'4px !important'}
          textAlign={'left'}
        >
          {t(
            'client:provider__third_party_confirm_dialog__important__description',
          )}
        </Typography>

        <ThirdPartyAIProviderRecommendations />

        <Stack direction={'row'} spacing={1} alignItems="center">
          <ChatOutlinedIcon
            sx={{
              color: 'rgba(66, 133, 244, 1)',
              fontSize: 24,
            }}
          />

          <Typography
            fontSize={16}
            fontWeight={500}
            color={'text.primary'}
            lineHeight={1.5}
          >
            {t(
              'client:provider__third_party_confirm_dialog__your_feedback_matters__title',
            )}
          </Typography>
        </Stack>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.secondary'}
          lineHeight={1.5}
          mt={'4px !important'}
          textAlign={'left'}
        >
          {t(
            'client:provider__third_party_confirm_dialog__your_feedback_matters__description',
          )}
        </Typography>
        <Typography
          sx={{ flexShrink: 0 }}
          mt={'8px !important'}
          fontSize={12}
          textAlign={'left'}
        >
          <Link
            color={'text.primary'}
            sx={{ cursor: 'pointer' }}
            underline={'always'}
            target={'_blank'}
            href={CHROME_EXTENSION_MAIL_TO}
          >
            {t(
              'client:provider__third_party_confirm_dialog__your_feedback_matters__button_title',
            )}
          </Link>
        </Typography>
      </Stack>
      <ThirdPartyAIProviderModelSelectorCard />
    </Box>
  )
}

export default ThirdPartAIProviderConfirmDialog
