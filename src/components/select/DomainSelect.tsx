import React, { FC, useMemo } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { SxProps } from '@mui/material/styles'

import { TOP_DOMAINS } from '@/utils/staticData'
import Typography from '@mui/material/Typography'
import { domain2Favicon } from '@/utils/dataHelper/websiteHelper'

interface DomainSelectProps {
  label?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  onChange?: (value: string) => void
  sx?: SxProps
}

function filterOptions(options: any[], { inputValue }: any) {
  const searchOptions = options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
  if (inputValue.length > 2) {
    if (!inputValue.split('.')[1]) {
      if (inputValue.endsWith('.')) {
        inputValue += 'com'
      } else {
        inputValue += '.com'
      }
    }
    try {
      const domain = new URL(
        /^http[s]?/.test(inputValue) ? inputValue : `https://${inputValue}`,
      ).hostname
        .replace(/^www\./, '')
        .replace(/:\d+$/, '')
      if (searchOptions.find((option) => option.value === domain)) {
        return searchOptions
      }
      searchOptions.push({
        label: domain,
        value: domain,
        origin: {
          inputValue,
        },
      })
    } catch (e) {
      console.log(e)
    }
  }
  return searchOptions
}

const DomainSelect: FC<DomainSelectProps> = (props) => {
  const {
    label = 'Enter website URL',
    onChange = (value: string) => {
      console.log(value)
    },
    disabled,
    sx,
  } = props
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(null)
  const memoOptions = useMemo(() => {
    if (
      props.value &&
      !TOP_DOMAINS.find((domain) => domain.value === props.value)
    ) {
      return TOP_DOMAINS.concat({
        label: props.value,
        value: props.value,
      })
    } else {
      return TOP_DOMAINS
    }
  }, [props.value])
  const memoValue = useMemo(() => {
    return memoOptions.find((option) => option.value === props.value)
  }, [props.value, memoOptions])
  return (
    <Autocomplete
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.stopPropagation()
        }
      }}
      disabled={disabled}
      open={open && !selected}
      onInputChange={(_, value) => {
        if (value !== props.value) {
          setSelected(null)
        }
        if (value.length === 0) {
          setOpen(false)
        } else {
          setOpen(true)
        }
      }}
      value={memoValue}
      onClose={() => setOpen(false)}
      freeSolo
      disableClearable
      clearOnBlur
      blurOnSelect
      size={'small'}
      sx={{ width: 160, ...sx }}
      autoHighlight
      getOptionLabel={(option) => option.label}
      options={memoOptions}
      onChange={(event: any, newValue) => {
        setSelected(newValue)
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
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <img
              width={16}
              height={16}
              src={domain2Favicon(option.value)}
              style={{ marginRight: 8 }}
            />
            <Typography color={'text.primary'} noWrap fontSize={14}>
              {option.label}
            </Typography>
          </li>
        )
      }}
    ></Autocomplete>
  )
}

export default DomainSelect
