import Button, { ButtonProps } from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { GoogleIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'

interface IProps {
  sx?: SxProps
  autoLogin?: boolean
  variant?: ButtonProps['variant']
}

const GoogleLoginButton: FC<IProps> = ({
  sx,
  // autoLogin,
  variant = 'contained',
}) => {
  const { t } = useTranslation()

  const colorSx = useMemo(() => {
    if (variant === 'contained') {
      return {
        color: 'white',
        bgcolor: '#4285F4',
        '&:hover': {
          bgcolor: '#4285F4',
        },
      }
    }

    // default outlined
    return {
      bgcolor: 'white',
      borderColor: '#dadce0',
      color: 'rgba(0,0,0,.54)',
      '&:hover': {
        borderColor: '#dadce0',
        bgcolor: 'white',
      },
    }
  }, [variant])

  return (
    <Button
      href={`${APP_USE_CHAT_GPT_HOST}/login?auto=true`}
      component="a"
      target="_target"
      startIcon={
        <Stack
          sx={{
            p: 0.5,
            bgcolor: 'white',
            borderRadius: '50%',
          }}
        >
          <GoogleIcon sx={{ fontSize: '24px' }} />
        </Stack>
      }
      variant={variant}
      sx={{
        height: 40,
        fontSize: 16,
        mt: 3,
        gap: 1,
        ...sx,

        // 基于 google 品牌宣传的要求 这里颜色不能修改
        // https://developers.google.com/identity/branding-guidelines
        ...colorSx,
      }}
    >
      {t('common:continue_with_google')}
    </Button>
  )
}
export default GoogleLoginButton
