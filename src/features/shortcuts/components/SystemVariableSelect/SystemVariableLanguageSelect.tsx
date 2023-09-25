import { Autocomplete, TextField } from '@mui/material'
import React, { FC } from 'react'
import { SystemVariableSelectProps } from '@/features/shortcuts/components/SystemVariableSelect/types'

const LANGUAGES_OPTIONS = [
  { language_code: 'uk', value: 'Ukrainian', label: 'Українська' },
  { language_code: 'so', value: 'Somali', label: 'Af Soomaali' },
  { language_code: 'af', value: 'Afrikaans', label: 'Afrikaans' },
  { language_code: 'az', value: 'Azerbaijani', label: 'Azərbaycan dili' },
  { language_code: 'id', value: 'Indonesian', label: 'Bahasa Indonesia' },
  {
    language_code: 'ms-MY',
    value: 'Malaysian Malay',
    label: 'Bahasa Malaysia',
  },
  { language_code: 'ms', value: 'Malay', label: 'Bahasa Melayu' },
  { language_code: 'jv', value: 'Javanese', label: 'Basa Jawa' },
  { language_code: 'su', value: 'Sundanese', label: 'Basa Sunda' },
  { language_code: 'bs', value: 'Bosnian', label: 'Bosanski jezik' },
  { language_code: 'ca', value: 'Catalan', label: 'Català' },
  { language_code: 'cs', value: 'Czech', label: 'Čeština' },
  { language_code: 'ny', value: 'Chichewa', label: 'Chichewa' },
  { language_code: 'cy', value: 'Welsh', label: 'Cymraeg' },
  { language_code: 'da', value: 'Danish', label: 'Dansk' },
  { language_code: 'de', value: 'German', label: 'Deutsch' },
  { language_code: 'et', value: 'Estonian', label: 'Eesti keel' },
  { language_code: 'en', value: 'English', label: 'English' },
  { language_code: 'en-GB', value: 'English (UK)', label: 'English (UK)' },
  { language_code: 'en-US', value: 'English (US)', label: 'English (US)' },
  { language_code: 'es', value: 'Spanish', label: 'Español' },
  { language_code: 'eo', value: 'Esperanto', label: 'Esperanto' },
  { language_code: 'eu', value: 'Basque', label: 'Euskara' },
  { language_code: 'fr', value: 'French', label: 'Français' },
  { language_code: 'ga', value: 'Irish', label: 'Gaeilge' },
  { language_code: 'gl', value: 'Galician', label: 'Galego' },
  { language_code: 'hr', value: 'Croatian', label: 'Hrvatski jezik' },
  { language_code: 'xh', value: 'Xhosa', label: 'isiXhosa' },
  { language_code: 'zu', value: 'Zulu', label: 'isiZulu' },
  { language_code: 'is', value: 'Icelandic', label: 'Íslenska' },
  { language_code: 'it', value: 'Italian', label: 'Italiano' },
  { language_code: 'sw', value: 'Swahili', label: 'Kiswahili' },
  { language_code: 'ht', value: 'Haitian Creole', label: 'Kreyòl Ayisyen' },
  { language_code: 'ku', value: 'Kurdish', label: 'Kurdî' },
  { language_code: 'la', value: 'Latin', label: 'Latīna' },
  { language_code: 'lv', value: 'Latvian', label: 'Latviešu valoda' },
  { language_code: 'lb', value: 'Luxembourgish', label: 'Lëtzebuergesch' },
  { language_code: 'lt', value: 'Lithuanian', label: 'Lietuvių kalba' },
  { language_code: 'hu', value: 'Hungarian', label: 'Magyar' },
  { language_code: 'mg', value: 'Malagasy', label: 'Malagasy' },
  { language_code: 'mt', value: 'Maltese', label: 'Malti' },
  { language_code: 'mi', value: 'Maori', label: 'Māori' },
  { language_code: 'nl', value: 'Dutch', label: 'Nederlands' },
  { language_code: 'no', value: 'Norwegian', label: 'Norsk' },
  { language_code: 'uz', value: 'Uzbek', label: `O'zbek tili` },
  { language_code: 'pl', value: 'Polish', label: 'Polski' },
  { language_code: 'pt', value: 'Portuguese', label: 'Português' },
  { language_code: 'ro', value: 'Romanian', label: 'Română' },
  { language_code: 'st', value: 'Sesotho', label: 'Sesotho' },
  { language_code: 'sq', value: 'Albanian', label: 'Shqip' },
  { language_code: 'sk', value: 'Slovak', label: 'Slovenčina' },
  { language_code: 'sl', value: 'Slovenian', label: 'Slovenščina' },
  { language_code: 'fi', value: 'Finnish', label: 'Suomi' },
  { language_code: 'sv', value: 'Swedish', label: 'Svenska' },
  { language_code: 'tl', value: 'Tagalog', label: 'Tagalog' },
  { language_code: 'tt', value: 'Tatar', label: 'Tatarça' },
  { language_code: 'tr', value: 'Turkish', label: 'Türkçe' },
  { language_code: 'vi', value: 'Vietnamese', label: 'Việt ngữ' },
  { language_code: 'yo', value: 'Yoruba', label: 'Yorùbá' },
  { language_code: 'el', value: 'Greek', label: 'Ελληνικά' },
  { language_code: 'be', value: 'Belarusian', label: 'Беларуская мова' },
  { language_code: 'bg', value: 'Bulgarian', label: 'Български език' },
  { language_code: 'ky', value: 'Kyrgyz', label: 'Кыр' },
  { language_code: 'kk', value: 'Kazakh', label: 'Қазақ тілі' },
  { language_code: 'mk', value: 'Macedonian', label: 'Македонски јазик' },
  { language_code: 'mn', value: 'Mongolian', label: 'Монгол хэл' },
  { language_code: 'ru', value: 'Russian', label: 'Русский' },
  { language_code: 'sr', value: 'Serbian', label: 'Српски језик' },
  { language_code: 'tg', value: 'Tajik', label: 'Тоҷикӣ' },
  { language_code: 'ka', value: 'Georgian', label: 'ქართული' },
  { language_code: 'hy', value: 'Armenian', label: 'Հայերեն' },
  { language_code: 'yi', value: 'Yiddish', label: 'ייִדיש' },
  { language_code: 'he', value: 'Hebrew', label: 'עברית' },
  { language_code: 'ug', value: 'Uyghur', label: 'ئۇيغۇرچە' },
  { language_code: 'ur', value: 'Urdu', label: 'اردو' },
  { language_code: 'ar', value: 'Arabic', label: 'العربية' },
  { language_code: 'ps', value: 'Pashto', label: 'پښتو' },
  { language_code: 'fa', value: 'Persian', label: 'فارسی' },
  { language_code: 'ne', value: 'Nepali', label: 'नेपाली' },
  { language_code: 'mr', value: 'Marathi', label: 'मराठी' },
  { language_code: 'hi', value: 'Hindi', label: 'हिन्दी' },
  { language_code: 'bn', value: 'Bengali', label: 'বাংলা' },
  { language_code: 'pa', value: 'Punjabi', label: 'ਪੰਜਾਬੀ' },
  { language_code: 'gu', value: 'Gujarati', label: 'ગુજરાતી' },
  { language_code: 'or', value: 'Oriya', label: 'ଓଡ଼ିଆ' },
  { language_code: 'ta', value: 'Tamil', label: 'தமிழ்' },
  { language_code: 'te', value: 'Telugu', label: 'తెలుగు' },
  { language_code: 'kn', value: 'Kannada', label: 'ಕನ್ನಡ' },
  { language_code: 'ml', value: 'Malayalam', label: 'മലയാളം' },
  { language_code: 'si', value: 'Sinhala', label: 'සිංහල' },
  { language_code: 'th', value: 'Thai', label: 'ไทย' },
  { language_code: 'lo', value: 'Lao', label: 'ພາສາລາວ' },
  { language_code: 'my', value: 'Burmese', label: 'ဗမာစာ' },
  { language_code: 'km', value: 'Khmer', label: 'ភាសាខ្មែរ' },
  { language_code: 'ko', value: 'Korean', label: '한국어' },
  { language_code: 'zh', value: 'Chinese', label: '中文' },
  { language_code: 'zh-TW', value: 'Traditional Chinese', label: '繁體中文' },
  { language_code: 'ja', value: 'Japanese', label: '日本語' },
]

function filterOptions(options: any[], { inputValue }: any) {
  return options.filter((option) => {
    const label = option.label.toLowerCase()
    const value = option.value.toLowerCase()
    const input = inputValue.toLowerCase()
    return label.includes(input) || value.includes(input)
  })
}

const SystemVariableLanguageSelect: FC<SystemVariableSelectProps> = (props) => {
  const {
    label = 'Output language',
    defaultValue = '',
    onChange = (value: string) => {
      console.log(value)
    },
    placeholder,
    sx,
  } = props
  const [value, setValue] = React.useState<{ label: string; value: string }>(
    () => {
      return (
        LANGUAGES_OPTIONS.find((option) => option.value === defaultValue) ||
        LANGUAGES_OPTIONS[0]
      )
    },
  )
  return (
    <Autocomplete
      componentsProps={{
        popper: {
          style: {
            width: 160,
          },
        },
      }}
      placeholder={placeholder}
      disableClearable
      value={value}
      size={'small'}
      sx={{ width: 160, ...sx }}
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
          InputLabelProps={{
            sx: { fontSize: '16px' },
            ...params.InputLabelProps,
          }}
          inputProps={{
            sx: {
              fontSize: '16px',
            },
            ...params.inputProps,
          }}
        />
      )}
    ></Autocomplete>
  )
}

export { SystemVariableLanguageSelect }
