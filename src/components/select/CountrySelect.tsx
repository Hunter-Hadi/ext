import FormControl from '@mui/material/FormControl'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React, { FC, useRef, useState } from 'react'

import { countryIcon, countryOptions } from '@/utils/dataHelper/websiteHelper'

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
