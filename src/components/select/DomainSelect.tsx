import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { SxProps } from '@mui/material/styles'
import { svgIconClasses } from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { type FC, memo, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { InputAssistantButtonGroupConfigHostKeys } from '@/features/contextMenu/components/InputAssistantButton/config'
import {
  SettingPromptsEditButtonKeyAtom,
  specialInputAssistantButtonKeys,
} from '@/pages/settings/pages/prompts/store'
import { domain2Favicon } from '@/utils/dataHelper/websiteHelper'
import { TOP_DOMAINS } from '@/utils/staticData'

interface DomainSelectProps {
  label?: string
  value?: any[]
  defaultValue?: string
  disabled?: boolean
  onChange?: (values: string[]) => void
  sx?: SxProps
  popperIndex?: number
  multiple?: boolean
  options?: any[]
}

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

function freeSolofilterOptions(options: any[], { inputValue }: any) {
  const searchOptions = filterOptions(options, { inputValue })
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
    onChange,
    disabled,
    popperIndex = 2147483620,
    sx,
    options = [],
    multiple,
  } = props

  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const isEditingSpecialInputAssistantButtonKey =
    settingPromptsEditButtonKey &&
    specialInputAssistantButtonKeys.includes(settingPromptsEditButtonKey)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const memoOptions = useMemo(() => {
    if (options?.length > 0) {
      return options
    }

    // instant reply
    if (isEditingSpecialInputAssistantButtonKey) {
      return InputAssistantButtonGroupConfigHostKeys.map((url) => ({
        label: url,
        value: url,
      }))
    }

    const newOptions = [...TOP_DOMAINS]

    if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
      newOptions.push({
        label: 'MaxAI PDF Viewer',
        value: Browser.runtime.getURL('/pages/pdf/web/viewer.html'),
      })
    }

    if (props?.value?.[0]) {
      if (multiple) {
        props.value.forEach((value) => {
          if (!newOptions.find((domain) => domain.value === value)) {
            newOptions.push({
              label: value,
              value,
            })
          }
        })
        return newOptions
      } else if (
        !newOptions.find((domain) => domain.value === props.value![0])
      ) {
        return newOptions.concat({
          label: props.value[0],
          value: props.value[0],
        } as any)
      }
    }

    return newOptions
  }, [props.value, options, multiple, settingPromptsEditButtonKey])

  const memoValue = useMemo(() => {
    if (multiple) {
      const values: { label: any; value: any }[] = []
      props?.value?.forEach((value) => {
        const selectedValue = memoOptions.find(
          (option) => option.value === value,
        )
        if (selectedValue) values.push(selectedValue)
      })
      return values
    } else {
      return memoOptions.find((option) => option.value === props?.value?.[0])
    }
  }, [props.value, memoOptions, multiple])

  return (
    <Autocomplete
      multiple={multiple}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.stopPropagation()
        }
      }}
      disabled={disabled}
      open={options.length === 0 ? open && !selected : void 0}
      onInputChange={
        options.length === 0
          ? (_, value) => {
              if (value !== props?.value?.[0]) {
                setSelected(null)
              }
              if (value.length === 0) {
                setOpen(false)
              } else {
                setOpen(true)
              }
            }
          : void 0
      }
      slotProps={{
        popper: {
          sx: {
            zIndex: popperIndex,
          },
        },
      }}
      value={memoValue}
      onClose={() => setOpen(false)}
      freeSolo={options?.length === 0}
      disableClearable
      clearOnBlur
      blurOnSelect
      size={'small'}
      sx={{
        width: 160,
        [`.${autocompleteClasses.popupIndicator} .${svgIconClasses.root}`]: {
          fontSize: 24,
        },
        ...sx,
      }}
      autoHighlight
      getOptionLabel={(option) => option.label || ''}
      options={memoOptions}
      onChange={(event: any, newValue) => {
        setSelected(newValue)
        onChange?.(
          multiple ? newValue.map(({ value }: any) => value) : [newValue.value],
        )
      }}
      filterOptions={
        options?.length === 0 && !isEditingSpecialInputAssistantButtonKey
          ? freeSolofilterOptions
          : filterOptions
      }
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
              src={domain2Favicon(
                option.label === 'MaxAI PDF Viewer' ? 'maxai.me' : option.value,
              )}
              style={{ marginRight: 8 }}
            />
            <Typography color={'text.primary'} noWrap fontSize={14}>
              {option.label}
            </Typography>
          </li>
        )
      }}
    />
  )
}

export default memo(DomainSelect)
