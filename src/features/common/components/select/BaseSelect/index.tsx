import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useState } from 'react'

import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import EmptyContent from '@/features/common/components/select/BaseSelect/EmptyContent'
import { hasData } from '@/features/common/utils'

type IOptionValueType = string | number
export type IOptionType = {
  label: string
  value: IOptionValueType
  // eslint-disable-next-line
  origin?: any
}
type renderLabelFunctionType = (
  value: string | number,
  option: IOptionType,
  index: number,
) => React.ReactNode
export interface IBaseSelectProps
  extends Omit<Partial<SelectProps>, 'onChange'> {
  defaultValue?: IOptionValueType
  emptyText?: string
  options: IOptionType[]
  renderLabel?: renderLabelFunctionType
  sx?: SxProps
  onChange?: (
    value: string | number,
    option: IOptionType,
    index: number,
  ) => void
  loading?: boolean
  renderHeader?: React.ReactNode
  renderFooter?: React.ReactNode
}

const findCurrentOption = (options: IOptionType[], value: IOptionValueType) => {
  let findIndex = 0
  const findOption = options.find((option, index) => {
    if (option.value === value) {
      findIndex = index
      return true
    }
    return false
  })
  return [value, findOption, findIndex] as Parameters<renderLabelFunctionType>
}

const BaseSelect: FC<IBaseSelectProps> = ({
  defaultValue,
  emptyText,
  options,
  renderLabel,
  MenuProps,
  sx,
  placeholder,
  onChange,
  loading = false,
  renderFooter,
  renderHeader,
  label,
  ...props
}) => {
  const [selectValue, setSelectValue] = useState(defaultValue || '')
  const isEmptyDataCache = useMemo(() => {
    return !hasData(options) && !loading
  }, [options, loading])
  const renderDom = (
    value: IOptionValueType,
    option: IOptionType,
    index: number,
  ) => {
    if (renderLabel) {
      return renderLabel(value, option || {}, index)
    }
    return <ListItemText primary={option?.label || ''} />
  }
  useEffect(() => {
    if (!selectValue && defaultValue) {
      setSelectValue(defaultValue)
    }
  }, [defaultValue])
  useEffect(() => {
    if (options.length && !loading && selectValue) {
      const selectOption = options.find(
        (option) => option.value === selectValue,
      )
      if (!selectOption) {
        setSelectValue('')
      }
    }
  }, [options, selectValue, loading])
  const optionsRenderCache = useMemo(() => {
    return options.map((option, index) => (
      <MenuItem key={index} value={option.value}>
        {renderDom(option.value, option, index)}
      </MenuItem>
    ))
  }, [options, selectValue, renderDom])
  return (
    <FormControl>
      {label && <InputLabel id="demo-simple-select-label">{label}</InputLabel>}
      <Select
        label={label}
        sx={{
          // bgcolor: 'background.paper',
          width: 220,
          lineHeight: '40px',
          padding: '8px 12px',
          height: 40,
          '& > .MuiSelect-select': {
            padding: 0,
          },
          ...sx,
        }}
        value={selectValue}
        onChange={(event) => {
          setSelectValue(event.target.value as string)
          onChange &&
            onChange(
              ...findCurrentOption(options, event.target.value as string),
            )
        }}
        renderValue={(value) => {
          if ((!value && placeholder) || options.length === 0) {
            return <em>{placeholder}</em>
          }
          return renderDom(...findCurrentOption(options, value as string))
        }}
        MenuProps={MenuProps}
        displayEmpty
        {...props}
      >
        {loading && <AppLoadingLayout size={32} loading={loading} />}
        {!isEmptyDataCache && renderHeader}
        {!isEmptyDataCache && optionsRenderCache}
        {!isEmptyDataCache && renderFooter}
        {isEmptyDataCache && <EmptyContent emptyText={emptyText} />}
      </Select>
    </FormControl>
  )
}
export default BaseSelect
