import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import PageHelpCard from '@/pages/settings/components/pageHelp/PageHelpCard'
import { useTranslation } from 'react-i18next'

const PromptsHelp: FC<{
  defaultOpen?: boolean
}> = ({ defaultOpen = false }) => {
  const { t } = useTranslation(['settings'])
  return (
    <Stack>
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t(
          'settings:feature_card__prompts__help__manage_your_own_prompts__title',
        )}
        listType={'bullet'}
        list={[
          t(
            'settings:feature_card__prompts__help__manage_your_own_prompts__item1',
          ),
          t(
            'settings:feature_card__prompts__help__manage_your_own_prompts__item2',
          ),
          t(
            'settings:feature_card__prompts__help__manage_your_own_prompts__item3',
          ),
          t(
            'settings:feature_card__prompts__help__manage_your_own_prompts__item4',
          ),
        ]}
      />
    </Stack>
  )
}
export default PromptsHelp
