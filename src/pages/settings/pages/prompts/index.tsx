import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import ContextMenuEditCard from '@/pages/settings/pages/prompts/ContextMenuEditCard'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'

const SettingsPromptsPage: FC = () => {
  const { syncLocalToServer } = useSyncSettingsChecker()
  const { t } = useTranslation(['settings'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__prompts__title')}
      id={'my-own-prompts'}
    >
      <ContextMenuEditCard
        iconSetting
        buttonKey={'textSelectPopupButton'}
        onUpdated={async () => {
          await syncLocalToServer()
        }}
      />
    </SettingsFeatureCardLayout>
  )
}
export default SettingsPromptsPage
