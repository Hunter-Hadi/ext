import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import FormLabelRequiredFlag from '@/features/shortcuts/components/ShortcutsActionsEditor/components/PromptVariableEditor/PromptVariableForm/FormLabelRequiredFlag'
import useShortcutEditorActionsVariables, {
  PRESET_VARIABLE_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

interface IPromptVariableFormProps {
  type: 'add' | 'edit' | 'view'
  initialValue?: IActionSetVariable
  onConfirm?: (data: IActionSetVariable) => void
  onCancel?: () => void
}

const inputProps = {
  sx: {
    fontSize: '16px !important',
  },
}

const formHelperTextProps = {
  sx: { ml: 0 },
}

const PromptVariableForm: FC<IPromptVariableFormProps> = (props) => {
  const { t } = useTranslation(['common', 'prompt_editor'])
  const { type, initialValue, onCancel, onConfirm } = props
  const { variables } = useShortcutEditorActionsVariables()
  const inputRefs = useRef<HTMLInputElement[]>([])
  const {
    setError,
    register,
    getValues,
    // reset,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<IActionSetVariable>()
  const placeholderRegisterForm = register('placeholder', {
    value: initialValue?.placeholder || '',
  })
  const labelRegisterForm = register('label', {
    value: initialValue?.label || '',
    required: true,
  })
  register('valueType', {
    value: initialValue?.valueType || 'Text',
  })
  register('VariableName', {
    value: initialValue?.VariableName || '',
  })

  const handleSubmit = async () => {
    const validation = await trigger()
    const formData = getValues()
    const label = (formData?.label || '').trim()
    if (type === 'add') {
      if (
        variables.find(
          (variable) => variable.label?.toLowerCase() === label.toLowerCase(),
        ) ||
        (PRESET_VARIABLE_MAP as any)[label.toUpperCase()]
      ) {
        setError('label', {
          type: 'custom',
          message: t(
            'prompt_editor:add_variable__error_message__variable_name_repeated',
          ),
        })
        return
      }
    }
    if (validation) {
      onConfirm?.({
        ...formData,
        label,
      })
    }
  }

  const handleVariableKeyPress = useCallback(
    async (event: any) => {
      const { key } = event
      // console.log('key', key)
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

  useEffectOnce(() => {
    console.log(inputRefs.current)
    if (inputRefs.current[0]) {
      // focus
      inputRefs.current[0].focus()
    }
  })
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={12}>
          <FormControl size='small' variant='standard' fullWidth>
            <FormLabel>
              <Typography variant='body2'>
                {t('prompt_editor:add_variable__variable_name__title')}
                <FormLabelRequiredFlag />
              </Typography>
            </FormLabel>
            <TextField
              disabled={type === 'view'}
              {...labelRegisterForm}
              size='small'
              InputProps={inputProps}
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
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl size='small' variant='standard' fullWidth>
            <FormLabel>
              <Typography variant='body2'>
                {t('prompt_editor:add_variable__variable_placeholder__title')}
              </Typography>
            </FormLabel>
            <TextField
              disabled={type === 'view'}
              {...placeholderRegisterForm}
              size='small'
              InputProps={inputProps}
              inputRef={(ref) => (inputRefs.current[1] = ref)}
              placeholder={t(
                'prompt_editor:add_variable__variable_placeholder__placeholder',
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Stack direction='row' justifyContent='flex-end' spacing={1} pt={1}>
            <Button variant='secondary' onClick={onCancel}>
              {t('prompt_editor:add_variable__cancel_button__title')}
            </Button>
            <Button variant='contained' onClick={handleSubmit}>
              {type === 'add'
                ? t('prompt_editor:add_variable__add_button__title')
                : t('prompt_editor:add_variable__save_button__title')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PromptVariableForm
