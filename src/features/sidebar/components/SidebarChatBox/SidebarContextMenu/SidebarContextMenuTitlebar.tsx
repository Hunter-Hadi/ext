import { Stack } from '@mui/material'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import LanguageSelector from '@/features/contextMenu/components/FloatingContextMenu/LanguageSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

import SidebarContextMenuHistoryButton from './SidebarContextMenuHistoryButton'

const SidebarContextMenuTitlebar: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { userSettings, setUserSettings } = useUserSettings()

  const showModelSelector = true

  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      sx={{
        wordBreak: 'break-word',
        color: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
        padding: '4px 0',
      }}
      component={'div'}
    >
      <Stack gap={'4px'} direction={'row'}>
        {showModelSelector && (
          <AIProviderModelSelectorButton
            disabled={!showModelSelector}
            sidebarConversationType={'ContextMenu'}
            size={'small'}
          />
        )}

        <LanguageSelector
          defaultValue={
            userSettings?.language === DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
              ? 'English'
              : userSettings?.language
          }
          onChangeLanguage={(lang) => {
            setUserSettings({
              language: lang,
            })
          }}
        />
      </Stack>

      <SidebarContextMenuHistoryButton
        container={document.body}
        TooltipProps={{
          placement: 'top',
          floatingMenuTooltip: true,
        }}
      />
    </Stack>
  )
}

export default SidebarContextMenuTitlebar
