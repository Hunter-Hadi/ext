import React, { FC } from 'react'
import { Autocomplete, SxProps, TextField } from '@mui/material'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

interface LanguageSelectProps {
  label?: string
  defaultValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
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
  } = props
  const [value, setValue] = React.useState<{ label: string; value: string }>(
    () => {
      return (
        LANGUAGES_OPTIONS.find((option) => option.value === defaultValue) ||
        LANGUAGES_OPTIONS[0]
      )
    },
  )
  return (
    <Autocomplete
      disableClearable
      value={value}
      size={'small'}
      sx={{ width: 160, ...sx }}
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
    ></Autocomplete>
  )
}

export default LanguageSelect
