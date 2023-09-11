import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectProps } from '@mui/material/Select'
import { SxProps } from '@mui/material/styles'

import React, { FC, useEffect, useMemo, useState } from 'react'

import EmptyContent from '@/components/select/EmptyContent'
import { hasData } from '@/utils'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import Typography from '@mui/material/Typography'
import PermissionWrapper, {
  PermissionWrapperProps,
} from '@/features/auth/components/PermissionWrapper'

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
  labelProp?: SxProps
  sx?: SxProps
  onChange?: (
    value: string | number,
    option: IOptionType,
    index: number,
  ) => void
  loading?: boolean
  renderHeader?: React.ReactNode
  renderFooter?: React.ReactNode
  labelSx?: SxProps
  onPermission?: PermissionWrapperProps['onPermission']
  displayLoading?: boolean
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
  labelProp,
  MenuProps,
  sx,
  placeholder,
  onChange,
  loading = false,
  renderFooter,
  renderHeader,
  label,
  labelSx,
  onPermission,
  displayLoading = true,
  ...props
}) => {
  const [selectValue, setSelectValue] = useState(defaultValue || '')
  const [open, setOpen] = React.useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleOpen = () => {
    setOpen(true)
  }
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
    return (
      <ListItemText sx={{ fontSize: '14px', color: 'text.primary' }}>
        <Typography
          sx={{
            fontSize: '14px',
            color: 'text.primary',
          }}
          component={'span'}
        >
          {option.label}
        </Typography>
      </ListItemText>
    )
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
    return options.map((option, index) => {
      if (option.origin.permission) {
        return (
          <PermissionWrapper
            key={index}
            sceneType={option.origin.permission.sceneType}
            allowedRoles={option.origin.permission.roles}
            onPermission={onPermission}
          >
            <MenuItem
              sx={{
                ...labelProp,
              }}
              selected={option.value === props.value}
              disabled={option.origin.disabled}
              value={option.value}
              onClick={(event) => {
                if (option.origin.disabled) {
                  event.stopPropagation()
                  event.preventDefault()
                }
                setSelectValue(option.value as string)
                onChange &&
                  onChange(
                    ...findCurrentOption(options, option.value as string),
                  )
                handleClose()
              }}
            >
              {renderDom(option.value, option, index)}
            </MenuItem>
          </PermissionWrapper>
        )
      }
      return (
        <MenuItem
          sx={{
            ...labelProp,
          }}
          key={index}
          disabled={option.origin.disabled}
          value={option.value}
          onClick={(event) => {
            if (option.origin.disabled) {
              event.stopPropagation()
              event.preventDefault()
            }
          }}
        >
          {renderDom(option.value, option, index)}
        </MenuItem>
      )
    })
  }, [options, props.value, renderDom])
  return (
    <FormControl>
      {label && (
        <InputLabel
          id="demo-simple-select-label"
          sx={{ fontSize: '14px', color: 'text.primary', ...labelSx }}
        >
          {label}
        </InputLabel>
      )}
      <Select
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        label={label}
        sx={{
          // bgcolor: 'background.paper',
          width: 220,
          lineHeight: '40px',
          padding: '8px 12px',
          height: 40,
          fontSize: '14px',
          '& > .use-chat-gpt-ai--MuiSelect-select': {
            padding: 0,
            '& > div': {
              margin: 0,
            },
          },
          ...sx,
        }}
        value={selectValue}
        onChange={(event, optionNode) => {
          if ((optionNode as any).props.disabled) {
            return
          }
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
        {loading && displayLoading && (
          <AppLoadingLayout size={16} loading={loading} />
        )}
        {!isEmptyDataCache && renderHeader}
        {!isEmptyDataCache && optionsRenderCache}
        {!isEmptyDataCache && renderFooter}
        {isEmptyDataCache && <EmptyContent emptyText={emptyText} />}
      </Select>
    </FormControl>
  )
}
export { BaseSelect }
