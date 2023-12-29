import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
interface IProps {
  defaultValue?: string
  onChange(value: IColorSchemaType): void
}

type IColorSchemaType = 'dark' | 'light'

const ColorSchemaSelect: FC<IProps> = ({ defaultValue, onChange }) => {
  const handleChange = (value: IColorSchemaType) => {
    onChange(value)
  }

  return (
    <FormControl size="small">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography>Light</Typography>
        <Switch
          checked={defaultValue === 'dark'}
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
