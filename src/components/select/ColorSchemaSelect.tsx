import React, { FC, useState } from 'react'
import { FormControl, Stack, Switch, Typography } from '@mui/material'

interface IProps {
  defaultValue?: string
  onChange(value: IColorSchemaType): void
}

type IColorSchemaType = 'dark' | 'light'

const ColorSchemaSelect: FC<IProps> = ({ defaultValue, onChange }) => {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (value: IColorSchemaType) => {
    setValue(value)
    onChange(value)
  }

  return (
    <FormControl size="small">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography>Ligth</Typography>
        <Switch
          checked={value === 'dark'}
          onChange={(event) => {
            handleChange(event.target.checked ? 'dark' : 'light')
          }}
        />
        <Typography>Dark</Typography>
      </Stack>

      {/* <Select
        value={value}
        onChange={(value) => {
          handleChange(value.target.value as IColorSchemaType)
        }}
      >
        {options.current.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select> */}
    </FormControl>
  )
}

export default ColorSchemaSelect
