import { useTranslation } from 'react-i18next'
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useRecoilState } from 'recoil'
import AIProviderOptions, { AIProviderOptionType } from '../AIProviderOptions'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import LoadingButton from '@mui/lab/LoadingButton'
import { ThirdPartAIProviderConfirmDialogState } from '@/features/chatgpt/store'
import ThirdPartAIProviderForEnhancedStability from './ThirdPartAIProviderForEnhancedStability'

interface ThirdPartAIProviderConfirmDialogProps {
  sx?: SxProps
}

const ThirdPartAIProviderConfirmDialog: FC<ThirdPartAIProviderConfirmDialogProps> = ({
  sx,
}) => {
  const { t } = useTranslation(['client'])
  const [dialogState, setDialogState] = useRecoilState(
    ThirdPartAIProviderConfirmDialogState,
  )
  const [loading, setLoading] = React.useState(false)

  const { open, confirmProviderValue, confirmFn } = dialogState

  const confirmProviderOption = useMemo(() => {
    return AIProviderOptions.find(
      (provider) => confirmProviderValue === provider.value,
    )
  }, [confirmProviderValue])

  const handleClose = () => {
    setDialogState({
      open: false,
      confirmProviderValue: '',
      confirmFn: undefined,
    })
  }

  const handleConfirmProvider = async (
    providerOption: AIProviderOptionType,
  ) => {
    try {
      setLoading(true)

      if (confirmFn) {
        await confirmFn(providerOption)
      }
      handleClose()
    } catch (error) {
      console.error('handleConfirmProvider error', error)
    } finally {
      setLoading(false)
    }
  }

  if (!confirmProviderOption || !open) {
    return null
  }

  return (
    <Box
      component={'div'}
      sx={{
        position: 'relative',
        borderRadius: '4px',
        border: '1px solid #EBEBEB',
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
        width: 434,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'column',
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
        <CloseOutlinedIcon />
      </IconButton>
      <Stack p={2} spacing={2}>
        <Typography
          fontSize={20}
          fontWeight={700}
          color={'text.primary'}
          lineHeight={1.4}
          pr={4}
        >
          {t('client:provider__confirm_dialog__title', {
            label: t(confirmProviderOption.label as any),
          })}
        </Typography>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t('client:provider__confirm_dialog__sub_title')}
        </Typography>

        <Divider />

        <Stack direction={'row'} spacing={1} alignItems="center">
          <NotificationImportantOutlinedIcon
            sx={{
              color: 'rgba(219, 68, 55, 1)',
            }}
          />

          <Typography
            fontSize={16}
            fontWeight={500}
            color={'text.primary'}
            lineHeight={1.5}
          >
            {t('client:provider__confirm_dialog__important_reminder')}
          </Typography>
        </Stack>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.secondary'}
          lineHeight={1.5}
          mt={'4px !important'}
        >
          {t('client:provider__confirm_dialog__important_reminder__desc')}
        </Typography>

        <ThirdPartAIProviderForEnhancedStability />

        <Stack direction={'row'} spacing={1} alignItems="center">
          <ChatOutlinedIcon
            sx={{
              color: 'rgba(66, 133, 244, 1)',
            }}
          />

          <Typography
            fontSize={16}
            fontWeight={500}
            color={'text.primary'}
            lineHeight={1.5}
          >
            {t('client:provider__confirm_dialog__your_feedback_matters')}
          </Typography>
        </Stack>

        <Typography
          fontSize={14}
          fontWeight={400}
          color={'text.secondary'}
          lineHeight={1.5}
          mt={'4px !important'}
        >
          {t('client:provider__confirm_dialog__your_feedback_matters__desc')}
        </Typography>
      </Stack>

      <Stack p={2}>
        <LoadingButton
          variant="normalOutlined"
          loading={loading}
          sx={{
            height: 40,
            borderRadius: 2,
            flex: 1,
          }}
          onClick={() => handleConfirmProvider(confirmProviderOption)}
        >
          {t('client:provider__confirm_dialog__continue_with', {
            label: t(confirmProviderOption.label as any),
          })}
        </LoadingButton>
      </Stack>
    </Box>
  )
}

export default ThirdPartAIProviderConfirmDialog
