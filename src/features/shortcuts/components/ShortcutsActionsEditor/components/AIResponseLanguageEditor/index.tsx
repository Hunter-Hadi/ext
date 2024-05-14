import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { chromeExtensionClientOpenPage } from '@/utils'

const AIResponseLanguageEditor: FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = (props) => {
  const { checked, onChange } = props

  const { t } = useTranslation(['prompt_editor'])

  return (
    <Stack spacing={1}>
      <Stack direction={'row'} alignItems="center">
        <Typography variant={'body1'}>
          {t('prompt_editor:ai_response_language__title')}
        </Typography>
      </Stack>
      <FormControlLabel
        sx={{
          p: '4px 16px',
          borderRadius: '4px',
          justifyContent: 'space-between',
          flexDirection: 'row-reverse',
          border: `1px solid`,
          borderColor: 'customColor.borderColor',
        }}
        control={<Switch checked={checked} />}
        label={
          <Stack direction={'row'} alignItems="center" gap={1}>
            <Typography variant={'body1'}>
              {t('prompt_editor:ai_response_language__settings__label_1')}
            </Typography>
            <Link
              underline={'always'}
              color={'text.primary'}
              onClick={() => {
                chromeExtensionClientOpenPage({
                  key: 'options',
                  query: '?id=ai-response-language#/language',
                })
              }}
            >
              <Typography variant={'body1'}>
                {t('prompt_editor:ai_response_language__settings__label_2')}
              </Typography>
            </Link>
          </Stack>
        }
        value={checked}
        onChange={(_, newChecked) => {
          onChange(newChecked)
        }}
      />
    </Stack>
  )
}

export default AIResponseLanguageEditor
