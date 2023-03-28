import React, { FC, useState } from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { FormControl } from '@mui/material'
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
  const [value, setValue] = useState<string>(defaultValue)
  return (
    <FormControl sx={{ m: 1, maxWidth: 160 }} size="small">
      <Select
        value={value}
        onChange={(value) => {
          setValue(value.target.value as string)
          onChange(value.target.value as string)
        }}
      >
        {LANGUAGES_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default LanguageSelect
