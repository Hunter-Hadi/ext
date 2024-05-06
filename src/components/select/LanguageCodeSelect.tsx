import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { inputBaseClasses } from '@mui/material/InputBase'
import { inputLabelClasses } from '@mui/material/InputLabel'
import { CSSObject, SxProps } from '@mui/material/styles'
import { svgIconClasses } from '@mui/material/SvgIcon'
import TextField from '@mui/material/TextField'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOptionType } from '@/components/select/BaseSelect'
import { LANGUAGE_CODE_MAP } from '@/i18n/types'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

interface LanguageCodeSelectProps {
  label?: string
  defaultValue?: string
  expandOptionsHandler?: (options: IOptionType[]) => IOptionType[]
  onChange?: (value: string) => void
  sx?: SxProps
}

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const enLabel = option.origin?.en_label?.toLowerCase() || ''
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return (
      label.includes(input) || value.includes(input) || enLabel.includes(input)
    )
  })
}

const LanguageCodeOptions = Object.keys(LANGUAGE_CODE_MAP).map((key) => {
  const languageCode = LANGUAGE_CODE_MAP[key]
  const option: IOptionType = {
    label: languageCode.label,
    value: key,
    origin: {
      value: key,
      ...languageCode,
    },
  }
  return option
})

const defaultLanguageCodeOption: IOptionType = {
  label: 'English',
  value: 'en',
  origin: {
    value: 'en',
    label: 'English',
    en_label: 'English',
  },
}

const LanguageCodeSelect: FC<LanguageCodeSelectProps> = (props) => {
  const {
    label = 'Choose a language',
    defaultValue = '',
    expandOptionsHandler,
    onChange = (value: string) => {
      console.log(value)
    },
    sx,
  } = props
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation(['common'])

  const options = useMemo(() => {
    return expandOptionsHandler
      ? expandOptionsHandler(LanguageCodeOptions)
      : LanguageCodeOptions
  }, [expandOptionsHandler])

  const [value, setValue] = React.useState<IOptionType>(() => {
    return (
      options.find((option) => option.value === defaultValue) ||
      defaultLanguageCodeOption
    )
  })

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
    // <PermissionWrapper
    //   sceneType={'PREFERRED_LANGUAGE'}
    //   // TODO 暂时不锁，因为language code没有统一的标准，无法让pricing hooks的card 单独i18n, 2023-08-03
    //   allowedRoles={['basic', 'elite', 'pro', 'pro_gift', 'new_user', 'free']}
    //   onPermission={async (currentPlan, cardSettings, [event, newValue]) => {
    //     if (newValue.value !== defaultLanguageCodeOption.value) {
    //       // 重置回默认语言
    //       setValue(defaultLanguageCodeOption)
    //       onChange(defaultLanguageCodeOption.value as string)
    //     }
    //     return {
    //       success: false,
    //     }
    //   }}
    //   TooltipProps={{
    //     placement: 'right',
    //   }}
    //   BoxProps={{
    //     sx: {
    //       maxWidth: 'fit-content',
    //     },
    //   }}
    // >
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
          fontSize: (sx as CSSObject)?.fontSize ?? 16,
        },
        [`.${inputBaseClasses.root}`]: {
          fontSize: (sx as CSSObject)?.fontSize ?? 16,
        },
        [`.${inputBaseClasses.root} fieldset > legend`]: {
          fontSize: 14,
        },
        [`.${autocompleteClasses.popupIndicator} .${svgIconClasses.root}`]: {
          fontSize: 24
        },
        ...sx,
      }}
      slotProps={{
        paper: {
          sx: {
            fontSize: (sx as CSSObject)?.fontSize ?? 16,
          },
        },
        popper: {
          sx: {
            zIndex: 2147483648,
          },
        },
      }}
      autoHighlight
      getOptionLabel={(option) => option.label}
      options={options}
      onChange={(event: any, newValue) => {
        event.stopPropagation()
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
    // </PermissionWrapper>
  )
}

export default LanguageCodeSelect
