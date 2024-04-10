import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'

import { SystemVariableSelectProps } from '@/features/shortcuts/components/SystemVariableSelect/types'

const WRITING_STYLES_OPTIONS = [
  { label: `Default`, value: `Default` },
  { value: `Academic`, label: `Academic` },
  { value: `Analytical`, label: `Analytical` },
  { value: `Argumentative`, label: `Argumentative` },
  { value: `Conversational`, label: `Conversational` },
  { value: `Creative`, label: `Creative` },
  { value: `Critical`, label: `Critical` },
  { value: `Descriptive`, label: `Descriptive` },
  { value: `Epigrammatic`, label: `Epigrammatic` },
  { value: `Epistolary`, label: `Epistolary` },
  { value: `Expository`, label: `Expository` },
  { value: `Informative`, label: `Informative` },
  { value: `Instructive`, label: `Instructive` },
  { value: `Journalistic`, label: `Journalistic` },
  { value: `Metaphorical`, label: `Metaphorical` },
  { value: `Narrative`, label: `Narrative` },
  { value: `Persuasive`, label: `Persuasive` },
  { value: `Poetic`, label: `Poetic` },
  { value: `Satirical`, label: `Satirical` },
  { value: `Technical`, label: `Technical` },
]

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

const SystemVariableWritingStyleSelect: FC<SystemVariableSelectProps> = (
  props,
) => {
  const {
    label = 'Writing style',
    defaultValue = 'Default',
    onChange = (value: string) => {
      console.log(value)
    },
    placeholder,
    sx,
  } = props
  const [value, setValue] = React.useState<{ label: string; value: string }>(
    () => {
      return (
        WRITING_STYLES_OPTIONS.find(
          (option) => option.value === defaultValue,
        ) || WRITING_STYLES_OPTIONS[0]
      )
    },
  )
  return (
    <Autocomplete
      componentsProps={{
        popper: {
          style: {
            width: 160,
          },
        },
      }}
      placeholder={placeholder}
      disableClearable
      value={value}
      size={'small'}
      sx={{ width: 160, ...sx }}
      autoHighlight
      getOptionLabel={(option) => option.label}
      options={WRITING_STYLES_OPTIONS}
      onChange={(event: any, newValue) => {
        event.stopPropagation
        setValue(newValue)
        onChange(newValue.value)
      }}
      onKeyDown={(event) => {
        event.stopPropagation()
      }}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputLabelProps={{
            sx: { fontSize: '16px' },
            ...params.InputLabelProps,
          }}
          inputProps={{
            sx: {
              fontSize: '16px',
            },
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    ></Autocomplete>
  )
}

export { SystemVariableWritingStyleSelect }
