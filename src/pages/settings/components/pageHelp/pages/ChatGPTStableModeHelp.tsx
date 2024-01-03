import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PageHelpCard from '@/pages/settings/components/pageHelp/PageHelpCard'

const ChatGPTStableModeHelp: FC<{
  defaultOpen?: boolean
}> = ({ defaultOpen = false }) => {
  const { t } = useTranslation(['settings'])
  return (
    <Stack>
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t(
          'settings:feature_card__chatgpt_stable_mode__help__benefits__title',
        )}
        listType={'bullet'}
        list={[
          t(
            'settings:feature_card__chatgpt_stable_mode__help__benefits__item1',
          ),
          t(
            'settings:feature_card__chatgpt_stable_mode__help__benefits__item2',
          ),
          t(
            'settings:feature_card__chatgpt_stable_mode__help__benefits__item3',
          ),
          t(
            'settings:feature_card__chatgpt_stable_mode__help__benefits__item4',
          ),
        ]}
      />
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t('settings:feature_card__chatgpt_stable_mode__protips__title')}
        listType={'bullet'}
        list={[t('settings:feature_card__chatgpt_stable_mode__protips__item1')]}
      />
    </Stack>
  )
}
export default ChatGPTStableModeHelp
