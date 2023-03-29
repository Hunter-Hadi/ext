import React, { FC } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

interface LanguageSelectProps {
  defaultValue?: string
  onChange?: (value: string) => void
}

const LanguageSelect: FC<LanguageSelectProps> = (props) => {
  const {
    defaultValue = '',
    onChange = (value: string) => {
      console.log(value)
    },
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
      sx={{ width: 160, my: 2 }}
      autoHighlight
      getOptionLabel={(option) => option.label}
      options={LANGUAGES_OPTIONS}
      onChange={(event: any, newValue) => {
        setValue(newValue)
        onChange(newValue.value)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a language"
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
