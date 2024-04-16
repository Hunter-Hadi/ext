import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import { inputBaseClasses } from '@mui/material/InputBase'
import { inputLabelClasses } from '@mui/material/InputLabel'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { LANGUAGES_OPTIONS } from '@/utils/staticData'

interface LanguageSelectProps {
  label?: string
  defaultValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
  boxSx?: SxProps
}

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

const LanguageSelect: FC<LanguageSelectProps> = (props) => {
  const {
    label = 'Choose a language',
    defaultValue = '',
    onChange = (value: string) => {
      console.log(value)
    },
    sx,
    boxSx,
  } = props
  const { t } = useTranslation(['common'])
  const [value, setValue] = React.useState<{ label: string; value: string }>(
    () => {
      return (
        LANGUAGES_OPTIONS.find((option) => option.value === defaultValue) ||
        LANGUAGES_OPTIONS[0]
      )
    },
  )

  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    // 为解决 input filter 输入时 和 youtube 快捷键冲突的问题，
    const isYoutube = getCurrentDomainHost() === 'youtube.com'

    if (!isYoutube || !open) {
      return
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'i') {
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  return (
    <Box sx={boxSx}>
      <Autocomplete
        open={open}
        onOpen={() => {
          setOpen(true)
        }}
        onClose={() => {
          setOpen(false)
        }}
        noOptionsText={t('common:no_options')}
        disableClearable
        value={value}
        size={'small'}
        sx={{
          width: 160,
          [`.${inputLabelClasses.root}`]: {
            fontSize: 16,
          },
          [`.${inputBaseClasses.root}`]: {
            fontSize: 16,
          },
          [`.${inputBaseClasses.root} fieldset > legend`]: {
            fontSize: 14,
          },
          ...sx,
        }}
        slotProps={{
          paper: {
            sx: {
              fontSize: 16,
            },
          },
        }}
        autoHighlight
        getOptionLabel={(option) => option.label}
        options={LANGUAGES_OPTIONS}
        onChange={(event: any, newValue) => {
          setValue(newValue)
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
      />
    </Box>
  )
}

export default LanguageSelect
