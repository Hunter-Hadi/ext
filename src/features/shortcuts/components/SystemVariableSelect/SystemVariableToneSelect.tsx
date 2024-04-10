import Autocomplete from '@mui/material/Autocomplete'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'

const TONE_OPTIONS = [
  { label: `Default`, value: `Default` },
  { label: `Authoritative`, value: `Authoritative` },
  { label: 'Casual', value: 'Casual' },
  { label: `Clinical`, value: `Clinical` },
  { label: `Cold`, value: `Cold` },
  { label: `Confident`, value: `Confident` },
  { label: `Cynical`, value: `Cynical` },
  { label: `Emotional`, value: `Emotional` },
  { label: `Empathetic`, value: `Empathetic` },
  { label: `Formal`, value: `Formal` },
  { label: `Friendly`, value: `Friendly` },
  { label: `Humorous`, value: `Humorous` },
  { label: `Informal`, value: `Informal` },
  { label: `Ironic`, value: `Ironic` },
  { label: `Optimistic`, value: `Optimistic` },
  { label: `Pessimistic`, value: `Pessimistic` },
  { label: `Playful`, value: `Playful` },
  { label: `Professional`, value: `Professional` },
  { label: `Sarcastic`, value: `Sarcastic` },
  { label: `Serious`, value: `Serious` },
  { label: `Straightforward`, value: `Straightforward` },
  { label: `Sympathetic`, value: `Sympathetic` },
  { label: `Tentative`, value: `Tentative` },
  { label: `Warm`, value: `Warm` },
]

interface toneSelectProps {
  label?: string
  placeholder?: string
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

const SystemVariableToneSelect: FC<toneSelectProps> = (props) => {
  const {
    label = 'Tone',
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
        TONE_OPTIONS.find((option) => option.value === defaultValue) ||
        TONE_OPTIONS[0]
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
      options={TONE_OPTIONS}
      onChange={(event: any, newValue) => {
        event.stopPropagation()
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

export { SystemVariableToneSelect }
