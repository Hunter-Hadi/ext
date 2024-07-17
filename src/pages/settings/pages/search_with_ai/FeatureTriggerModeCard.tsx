import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { TRIGGER_MODE_OPTIONS } from '@/features/searchWithAI/constants'
import useSearchWithAISettings from '@/features/searchWithAI/hooks/useSearchWithAISettings'
import { ISearchWithAISettings } from '@/features/searchWithAI/utils/searchWithAISettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'

const FeatureTriggerModeCard: FC = () => {
  const { t } = useTranslation('settings')
  const { searchWithAISettings, setSearchWithAISettings } =
    useSearchWithAISettings()

  return (
    <SettingsFeatureCardLayout
      title={t('feature__search_with_ai__trigger_mode__title')}
      id={'trigger-mode'}
    >
      <RadioGroup
        aria-labelledby='demo-radio-buttons-group-label'
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
                    variant='body1'
                    color='text.primary'
                    fontWeight={600}
                  >
                    {t(option.name)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
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
