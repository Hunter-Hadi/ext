import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import PageHelpCard from '@/pages/settings/components/pageHelp/PageHelpCard'

const AppearanceHelp: FC<{
  defaultOpen?: boolean
}> = ({ defaultOpen = false }) => {
  const { t } = useTranslation(['settings'])
  return (
    <Stack>
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t(
          'settings:feature_card__appearance__field_pdf_viewer__help__benefits__title',
        )}
        listType={'bullet'}
        list={[
          t(
            'settings:feature_card__appearance__field_pdf_viewer__help__benefits__item1',
          ),
          t(
            'settings:feature_card__appearance__field_pdf_viewer__help__benefits__item2',
          ),
        ]}
      />
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t(
          'settings:feature_card__appearance__field_pdf_viewer__help__caveats__title',
        )}
        listType={'bullet'}
        list={[
          t(
            'settings:feature_card__appearance__field_pdf_viewer__help__caveats__item1',
          ),
          t(
            'settings:feature_card__appearance__field_pdf_viewer__help__caveats__item2',
          ),
        ]}
      />
    </Stack>
  )
}
export default AppearanceHelp
