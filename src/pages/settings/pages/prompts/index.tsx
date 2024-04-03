import styled from '@emotion/styled'
import Stack, { type StackProps } from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import React, { type FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'

import SettingPromptsPageHeader, { type SettingPromptsPageHeaderTabKey } from './components/SettingPromptsPageHeader'
import SettingPromptsContextMenuCard from './SettingPromptsContextMenuCard';
import SettingPromptsWritingAssistantCard from './SettingPromptsWritingAssistantCard'

const SettingsPromptPageCardLayout = styled(({ ...props }: StackProps) => <Stack {...props} />)(
  ({ theme }) => {
    const t = theme as Theme
    const isDark = t.palette.mode === 'dark'
    return {
      background: isDark ? 'rgb(32, 33, 36)' : 'rgba(255, 255, 255, 1)',
      padding: '16px',
      border: '1px solid',
      borderColor: t.palette?.customColor!.borderColor,
      borderRadius: '0 0 8px 8px',
    }
  },
)

const SettingsPromptsPage: FC = () => {
  const { t } = useTranslation(['settings'])
  const [activeTab, setActiveTab] = useState<SettingPromptsPageHeaderTabKey>('CONTEXT_MENU');
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    switch (searchParams.get('tab')) {
      case 'writing-assistant': setActiveTab('WRITING_ASSISTANT'); break;
      // case 'summary': setActiveTab('SUMMARY'); break;
      // case 'search': setActiveTab('SEARCH'); break;
      case 'context-menu':
      default: setActiveTab('CONTEXT_MENU');
    }
  }, [])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__prompts__title')}
      id={'my-own-prompts'}
    >
      <SettingPromptsPageHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <SettingsPromptPageCardLayout>
        {activeTab === 'CONTEXT_MENU' && <SettingPromptsContextMenuCard />}
        {activeTab === 'WRITING_ASSISTANT' && <SettingPromptsWritingAssistantCard />}
      </SettingsPromptPageCardLayout>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsPromptsPage 
