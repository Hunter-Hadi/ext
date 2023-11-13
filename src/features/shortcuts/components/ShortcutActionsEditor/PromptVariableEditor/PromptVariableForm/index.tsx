import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { FC, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import FormLabelRequiredFlag from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor/PromptVariableForm/FormLabelRequiredFlag'
import useEffectOnce from '@/hooks/useEffectOnce'
import useShortcutEditorActionsVariables from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActionsVariables'

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
    if (variables.find((variable) => variable.label === label)) {
      setError('label', {
        type: 'custom',
        message: 'Variable names cannot be repeated',
      })
      return
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
        <pre>{JSON.stringify(getValues())}</pre>
        <Grid item xs={12}>
          <FormControl size="small" variant="standard" fullWidth>
            <FormLabel>
              <Typography variant="body2">
                Variable name
                <FormLabelRequiredFlag />
              </Typography>
            </FormLabel>
            <TextField
              disabled={type === 'view'}
              {...labelRegisterForm}
              size="small"
              InputProps={inputProps}
              onKeyPress={(event) => handleVariableKeyPress(event)}
              placeholder="Enter variable name"
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
          <FormControl size="small" variant="standard" fullWidth>
            <FormLabel>
              <Typography variant="body2">Variable placeholder</Typography>
            </FormLabel>
            <TextField
              disabled={type === 'view'}
              {...placeholderRegisterForm}
              size="small"
              InputProps={inputProps}
              inputRef={(ref) => (inputRefs.current[1] = ref)}
              placeholder="Enter variable placeholder"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={1} pt={1}>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {type === 'add' ? 'Add' : 'Save'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PromptVariableForm
