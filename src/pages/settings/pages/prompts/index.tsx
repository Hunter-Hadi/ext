import styled from '@emotion/styled'
import Stack, { type StackProps } from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import React, { type FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { restoreChromeExtensionSettingsSnapshot } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'
import {
  checkSettingsSync,
  isSettingsLastModifiedEqual,
  syncLocalSettingsToServerSettings,
} from '@/background/utils/syncSettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import SettingPromptsRestorer from '@/pages/settings/pages/prompts/components/SettingPromptsRestorer'

import SettingPromptsPageHeader, {
  type SettingPromptsPageHeaderTabKey,
} from './components/SettingPromptsPageHeader'
import SettingPromptsContextMenuCard from './SettingPromptsContextMenuCard'
import SettingPromptsSummaryCard from './SettingPromptsSummaryCard'
import SettingPromptsWritingAssistantCard from './SettingPromptsWritingAssistantCard'

const SettingsPromptPageCardLayout = styled(({ ...props }: StackProps) => (
  <Stack {...props} />
))(({ theme }) => {
  const t = theme as Theme
  const isDark = t.palette.mode === 'dark'
  return {
    background: isDark ? 'rgb(32, 33, 36)' : 'rgba(255, 255, 255, 1)',
    padding: '16px',
    border: '1px solid',
    borderColor: t.palette?.customColor!.borderColor,
    borderRadius: '0 0 8px 8px',
  }
})

const SettingsPromptsPage: FC = () => {
  const { t } = useTranslation(['settings'])
  const [activeTab, setActiveTab] =
    useState<SettingPromptsPageHeaderTabKey>('CONTEXT_MENU')
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    switch (searchParams.get('tab')) {
      case 'instant-reply':
        setActiveTab('INSTANT_REPLY')
        break
      case 'summary': setActiveTab('SUMMARY'); break;
      // case 'search': setActiveTab('SEARCH'); break;
      case 'context-menu':
      default:
        setActiveTab('CONTEXT_MENU')
    }
  }, [])
  return (
    <SettingsFeatureCardLayout
      sx={{
        '& .maxai-settings--feature-card--title': {
          width: '100%',
        },
      }}
      // title={t('settings:feature_card__prompts__title')}
      title={
        <Stack
          width={'100%'}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <span>{t('settings:feature_card__prompts__title')}</span>
          <SettingPromptsRestorer
            onRestore={async (snapshot) => {
              try {
                const { buttonSettings } = snapshot.settings
                if (!buttonSettings) return
                // 更新插件
                if (!(await isSettingsLastModifiedEqual())) {
                  await checkSettingsSync()
                }
                // 更新本地own prompts
                await restoreChromeExtensionSettingsSnapshot(snapshot)
                // 更新服务器own prompts
                await syncLocalSettingsToServerSettings()
                // refresh页面
                location.reload()
              } catch (e) {
                console.error(e)
              }
            }}
          />
        </Stack>
      }
      id={'my-own-prompts'}
    >
      <SettingPromptsPageHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <SettingsPromptPageCardLayout>
        {activeTab === 'CONTEXT_MENU' && <SettingPromptsContextMenuCard />}
        {activeTab === 'INSTANT_REPLY' && (
          <SettingPromptsWritingAssistantCard />
        )}
        {activeTab === 'SUMMARY' && (
          <SettingPromptsSummaryCard />
        )}
      </SettingsPromptPageCardLayout>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsPromptsPage
