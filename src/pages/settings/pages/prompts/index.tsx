import styled from '@emotion/styled'
import Stack, { type StackProps } from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import React, { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'

import SettingPromptsPageHeader, { type SettingPromptsPageHeaderTabKey } from './components/SettingPromptsPageHeader'
import SettingPromptsContextMenuCard from './SettingPromptsContextMenuCard';

const SettingsPromptPageCardLayout = styled(({ ...props }: StackProps) => <Stack {...props} />)(
  ({ theme }) => {
    const t = theme as Theme
    const isDark = t.palette.mode === 'dark'
    return {
      background: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 1)',
      padding: '16px',
      border: '1px solid',
      borderColor: isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      borderRadius: '8px',
    }
  },
)

const SettingsPromptsPage: FC = () => {
  const { t } = useTranslation(['settings'])
  const [activeTab, setActiveTab] = useState<SettingPromptsPageHeaderTabKey>('CONTEXT_MENU');
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__prompts__title')}
      id={'my-own-prompts'}
    >
      <SettingPromptsPageHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <SettingsPromptPageCardLayout>
        {activeTab === 'CONTEXT_MENU' && <SettingPromptsContextMenuCard iconSetting />}
      </SettingsPromptPageCardLayout>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsPromptsPage
