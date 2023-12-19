import FormControl, { FormControlProps } from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Controller, UseControllerProps } from 'react-hook-form'

type IOptionValueType = string | number
type IOptionType = {
  label: string
  value: IOptionValueType
  // eslint-disable-next-line
  origin?: any
}

interface ReactHookFormSelectProps<T> extends UseControllerProps<T> {
  label: string
  children?: React.ReactNode
  options?: IOptionType[]
  FormControlProps?: FormControlProps
  SelectProps?: SelectProps
  MenuItemProps?: MenuItemProps
}

const ReactHookFormSelect = <T,>(props: ReactHookFormSelectProps<T>) => {
  const {
    defaultValue,
    label,
    name,
    control,
    disabled,
    rules,
    FormControlProps,
    SelectProps,
    MenuItemProps,
    children,
    options,
  } = props
  const labelId = `${name}-label`
  return (
    <FormControl {...FormControlProps}>
      <FormLabel id={labelId}>
        <Typography variant="body1">{label}</Typography>
      </FormLabel>
      <Controller
        name={name}
        control={control}
        disabled={disabled}
        rules={rules}
        render={({ field, fieldState, formState }) => {
          const { onChange, ...rest } = SelectProps || {}
          return (
            <Select
              ref={field.ref}
              disabled={disabled}
              value={field.value || defaultValue}
              onChange={(event, child) => {
                field.onChange(event)
                onChange?.(event, child)
              }}
              {...rest}
            >
              {options
                ? options.map((option) => {
                    return (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{
                          ...MenuItemProps,
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    )
                  })
                : children}
            </Select>
          )
        }}
      />
    </FormControl>
  )
}

export default ReactHookFormSelect
