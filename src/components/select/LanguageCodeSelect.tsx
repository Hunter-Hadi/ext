import Autocomplete from '@mui/material/Autocomplete'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { IOptionType } from '@/components/select/BaseSelect'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
import { LANGUAGE_CODE_MAP } from '@/i18n/types'

interface LanguageCodeSelectProps {
  label?: string
  defaultValue?: string
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
    onChange = (value: string) => {
      console.log(value)
    },
    sx,
  } = props
  const { t } = useTranslation(['common'])
  const [value, setValue] = React.useState<IOptionType>(() => {
    return (
      LanguageCodeOptions.find((option) => option.value === defaultValue) ||
      defaultLanguageCodeOption
    )
  })
  return (
    <PermissionWrapper
      sceneType={'PREFERRED_LANGUAGE'}
      // TODO 暂时不锁，因为language code没有统一的标准，无法让pricing hooks的card 单独i18n, 2023-08-03
      allowedRoles={['elite', 'pro', 'pro_gift', 'new_user', 'free']}
      onPermission={async (currentPlan, cardSettings, [event, newValue]) => {
        if (newValue.value !== defaultLanguageCodeOption.value) {
          // 重置回默认语言
          setValue(defaultLanguageCodeOption)
          onChange(defaultLanguageCodeOption.value as string)
        }
        return {
          success: false,
        }
      }}
      TooltipProps={{
        placement: 'right',
      }}
      BoxProps={{
        sx: {
          maxWidth: 'fit-content',
        },
      }}
    >
      <Autocomplete
        noOptionsText={t('common:no_options')}
        disableClearable
        value={value}
        size={'small'}
        sx={{ width: 160, ...sx }}
        autoHighlight
        getOptionLabel={(option) => option.label}
        options={LanguageCodeOptions}
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
    </PermissionWrapper>
  )
}

export default LanguageCodeSelect
