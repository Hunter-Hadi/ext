import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import useSearchWithAISettings from '@/features/searchWithAI/hooks/useSearchWithAISettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { ISearchWithAISettings } from '@/features/searchWithAI/utils/searchWithAISettings'

const TRIGGER_MODE_OPTIONS = [
  {
    name: 'feature__search_with_ai__trigger_mode__always__name',
    value: 'always',
    desc: 'feature__search_with_ai__trigger_mode__always__desc',
  },
  {
    name: 'feature__search_with_ai__trigger_mode__question-mask__name',
    value: 'question-mask',
    desc: 'feature__search_with_ai__trigger_mode__question-mask__desc',
  },
  {
    name: 'feature__search_with_ai__trigger_mode__manual__name',
    value: 'manual',
    desc: 'feature__search_with_ai__trigger_mode__manual__desc',
  },
] as const

const FeatureTriggerModeCard: FC = () => {
  const { t } = useTranslation('settings')
  const {
    searchWithAISettings,
    setSearchWithAISettings,
  } = useSearchWithAISettings()

  return (
    <SettingsFeatureCardLayout
      title={t('feature__search_with_ai__trigger_mode__title')}
      id={'trigger-mode'}
    >
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        value={searchWithAISettings.triggerMode}
        onChange={(event) => {
          const value = event.target
            .value as ISearchWithAISettings['triggerMode']
          setSearchWithAISettings({
            triggerMode: value,
          })
        }}
      >
        {TRIGGER_MODE_OPTIONS.map((option) => {
          return (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              sx={{
                mb: 2,
              }}
              label={
                <Stack>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    fontWeight={600}
                  >
                    {t(option.name)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(option.desc)}
                  </Typography>
                </Stack>
              }
            />
          )
        })}
      </RadioGroup>
    </SettingsFeatureCardLayout>
  )
}
export default FeatureTriggerModeCard
