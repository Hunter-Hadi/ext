import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useShortcutEditorActionsVariables, {
  PRESET_VARIABLE_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

interface IProps {
  type: 'add' | 'update'
  variable?: IActionSetVariable | null
  open: boolean
  onSave: (name: string, placeholder?: string) => void
  onClose: () => void
}

const formHelperTextProps = {
  sx: { ml: 0 },
}

const VariableFormModel: FC<IProps> = (props) => {
  const { type, variable, open, onSave, onClose } = props
  const { t } = useTranslation(['common', 'prompt_editor'])
  const { variables } = useShortcutEditorActionsVariables()
  const inputRefs = useRef<HTMLInputElement[]>([])
  const {
    setError,
    register,
    getValues,
    reset,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<IActionSetVariable>()

  const placeholderRegisterForm = register('placeholder', {
    value: variable?.placeholder || '',
  })
  const labelRegisterForm = register('label', {
    value: variable?.label || '',
    required: true,
  })

  useEffect(() => {
    reset()
  }, [open])

  const handleSubmit = async () => {
    const validation = await trigger()
    const formData = getValues()
    const label = (formData?.label || '').trim()
    const includeItem =
      variables.find(
        (item) => item.label?.toLowerCase() === label.toLowerCase(),
      ) || (PRESET_VARIABLE_MAP as any)[label.toUpperCase()]
    if (includeItem && includeItem !== variable) {
      setError('label', {
        type: 'custom',
        message: t(
          'prompt_editor:add_variable__error_message__variable_name_repeated',
        ),
      })
      return
    }
    if (validation) {
      onSave(label, formData.placeholder)
    }
  }

  const handleVariableKeyPress = useCallback(
    async (event: any) => {
      const { key } = event
      clearErrors()
      if (key === 'Enter') {
        for (let i = 0; i < inputRefs.current.length; i++) {
          const inputElement = inputRefs.current[i]
          if (!inputElement.value) {
            if (i === inputRefs.current.length - 1) {
              continue
            }
            inputElement.focus()
            return
          }
        }
        await handleSubmit()
      }
      if (key === '{' || key === '}') {
        event.preventDefault()
        console.log('not allowed input { or }')
      }
    },
    [handleSubmit],
  )

  return (
    <Modal open={open} onClose={onClose}>
      <Container
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '4px',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3d3d3d' : '#fff'),
          maxWidth: '512px!important',
          p: 2,
        }}
      >
        <Stack spacing={2}>
          <Typography fontSize="20px" fontWeight={600} color="text.primary">
            Update variable
          </Typography>

          <FormControl size="small" variant="standard" fullWidth>
            <Stack spacing={1}>
              <FormLabel>
                <Typography variant={'body1'}>
                  {t('prompt_editor:add_variable__variable_name__title')}
                  <span style={{ color: 'red' }}>*</span>
                </Typography>
              </FormLabel>

              <TextField
                {...labelRegisterForm}
                autoFocus
                size="small"
                onKeyPress={(event) => handleVariableKeyPress(event)}
                placeholder={t(
                  'prompt_editor:add_variable__variable_name__placeholder',
                )}
                error={!!errors.label}
                FormHelperTextProps={formHelperTextProps}
                inputRef={(ref) => (inputRefs.current[0] = ref)}
                helperText={
                  errors.label
                    ? errors.label?.message || 'Variable name is required'
                    : ''
                }
              />
            </Stack>
          </FormControl>

          <FormControl size="small" variant="standard" fullWidth>
            <Stack spacing={1}>
              <FormLabel>
                <Typography variant={'body1'}>
                  {t('prompt_editor:add_variable__variable_placeholder__title')}
                </Typography>
              </FormLabel>

              <TextField
                {...placeholderRegisterForm}
                size="small"
                placeholder={t(
                  'prompt_editor:add_variable__variable_placeholder__placeholder',
                )}
                inputRef={(ref) => (inputRefs.current[1] = ref)}
              />
            </Stack>
          </FormControl>

          <Stack direction="row" spacing={1} justifyContent="end">
            <Button variant="outlined" onClick={onClose}>
              {t('prompt_editor:add_variable__cancel_button__title')}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {type === 'add'
                ? t('prompt_editor:add_variable__add_button__title')
                : t('prompt_editor:add_variable__save_button__title')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}

export default VariableFormModel
