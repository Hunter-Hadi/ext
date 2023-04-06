import React, { FC, useRef, useState } from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import { countryIcon, countryOptions } from '@/utils'
import { FormControl } from '@mui/material'

interface CountrySelectProps {
  defaultValue?: string
}

const CountrySelect: FC<CountrySelectProps> = (props) => {
  const [value, setValue] = useState<string>('')
  const options = useRef(countryOptions())
  return (
    <FormControl size="small">
      <Select
        value={value}
        onChange={(value) => {
          setValue(value.target.value as string)
        }}
      >
        {options.current.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <ListItemIcon>
              <img
                width={32}
                height={24}
                src={countryIcon(option.label, '32x24')}
              />
            </ListItemIcon>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CountrySelect