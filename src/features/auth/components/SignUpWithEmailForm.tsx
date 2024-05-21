import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Grow from '@mui/material/Grow'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import React, { FormEvent, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { checkIsEmail } from '@/utils/dataHelper/stringHelper'

interface IFormInputs {
  email: string
}

const SignUpWithEmailForm = () => {
  const { t } = useTranslation()
  const [errorData, setErrorData] = useState('')
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<IFormInputs>({
    mode: 'all',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: IFormInputs) => {
    if (!isValid) return
    window.open(
      `${APP_USE_CHAT_GPT_HOST}/login?email=${decodeURIComponent(data.email)}`,
    )
  }

  return (
    <Stack
      spacing={2}
      component="form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        handleSubmit(onSubmit)()
      }}
    >
      <Controller
        name={'email'}
        control={control}
        rules={{
          required: true,
          validate: {
            required: (value) =>
              (checkIsEmail(value) && !value.includes('+')) || false,
          },
        }}
        render={({ field: { value, onChange }, fieldState }) => {
          const errMsg: string = fieldState?.error?.message ?? ''
          return (
            <TextField
              error={errMsg ? true : false}
              value={value || ''}
              type="text"
              name={'email'}
              onChange={({ target: { value } }) =>
                onChange(value.trim().toString().toLowerCase())
              }
              InputProps={{
                sx: {
                  borderRadius: 2,
                },
              }}
              onKeyDown={() => {
                if (errorData) {
                  setErrorData('')
                }
              }}
              label={
                errMsg ? errMsg : t('client:login_modal__email__placeholder')
              }
              fullWidth
            />
          )
        }}
      />
      {errorData && (
        <Box sx={{ maxWidth: '100%', mt: 1 }}>
          <Grow in={errorData ? true : false} mountOnEnter unmountOnExit>
            <Alert
              severity="error"
              icon={false}
              sx={{ wordWrap: 'break-word', maxWidth: '100%' }}
            >
              {errorData}
            </Alert>
          </Grow>
        </Box>
      )}
      <Stack spacing={3}>
        <LoadingButton
          disabled={!isValid}
          variant="contained"
          disableElevation
          size="large"
          fullWidth
          type="submit"
          sx={{ height: 56, fontSize: 16, fontWeight: 700, borderRadius: 2 }}
        >
          <span>{t('common:continue_with_email')}</span>
        </LoadingButton>
      </Stack>
    </Stack>
  )
}

export default SignUpWithEmailForm
