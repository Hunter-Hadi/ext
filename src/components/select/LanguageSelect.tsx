import Autocomplete from '@mui/material/Autocomplete'
import { inputBaseClasses } from '@mui/material/InputBase'
import { inputLabelClasses } from '@mui/material/InputLabel'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_AI_OUTPUT_LANGUAGE_ID } from '@/constants'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

interface LanguageSelectProps {
  label?: string
  defaultValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
  boxSx?: SxProps
}

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

const LanguageSelect: FC<LanguageSelectProps> = (props) => {
  const {
    label = 'Choose a language',
    defaultValue = '',
    onChange = (value: string) => {
      console.log(value)
    },
    sx,
    boxSx,
  } = props
  const { t } = useTranslation(['common'])
  const [value, setValue] = React.useState<{ label: string; value: string }>(
    () => {
      return (
        LANGUAGES_OPTIONS.find((option) => option.value === defaultValue) ||
        LANGUAGES_OPTIONS[0]
      )
    },
  )
  return (
    <PermissionWrapper
      sceneType={'AI_RESPONSE_LANGUAGE'}
      allowedRoles={['elite', 'pro', 'pro_gift', 'new_user']}
      onPermission={async (currentPlan, cardSettings, [event, newValue]) => {
        if (newValue.value !== DEFAULT_AI_OUTPUT_LANGUAGE_ID) {
          // 重置回默认语言
          setValue(LANGUAGES_OPTIONS[0])
          onChange(LANGUAGES_OPTIONS[0].value)
        }
        return {
          success: false,
        }
      }}
      TooltipProps={{
        placement: 'right',
      }}
      BoxProps={{
        sx: {
          maxWidth: 'fit-content',
          ...boxSx,
        },
      }}
    >
      <Autocomplete
        noOptionsText={t('common:no_options')}
        disableClearable
        value={value}
        size={'small'}
        sx={{
          width: 160,
          [`.${inputLabelClasses.root}`]: {
            fontSize: 16,
          },
          [`.${inputBaseClasses.root}`]: {
            fontSize: 16,
          },
          [`.${inputBaseClasses.root} fieldset > legend`]: {
            fontSize: 14,
          },
          ...sx,
        }}
        slotProps={{
          paper: {
            sx: {
              fontSize: 14,
            },
          },
        }}
        autoHighlight
        getOptionLabel={(option) => option.label}
        options={LANGUAGES_OPTIONS}
        onChange={(event: any, newValue) => {
          setValue(newValue)
          onChange(newValue.value)
        }}
        filterOptions={filterOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            inputProps={{
              ...params.inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
            }}
          />
        )}
      />
    </PermissionWrapper>
  )
}

export default LanguageSelect
