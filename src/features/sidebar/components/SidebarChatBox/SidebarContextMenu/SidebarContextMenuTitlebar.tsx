import { Stack } from '@mui/material'
import React, { FC, useMemo } from 'react'

import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import LanguageSelector from '@/features/contextMenu/components/FloatingContextMenu/LanguageSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import SidebarContextMenuHistoryButton from './SidebarContextMenuHistoryButton'

const SidebarContextMenuTitlebar: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()

  const isImmersivePage = useMemo(() => isMaxAIImmersiveChatPage(), [])
  const showModelSelector = true
  const container = useMemo(
    () => getMaxAISidebarRootElement() || document.body,
    [],
  )

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
            placement='bottom-start'
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
          placement='bottom-start'
          inSidebar
        />
      </Stack>

      {/* immersive chat 中就不显示了 */}
      {!isImmersivePage && (
        <SidebarContextMenuHistoryButton
          container={container}
          TooltipProps={{
            placement: 'top',
            floatingMenuTooltip: true,
          }}
        />
      )}
    </Stack>
  )
}

export default SidebarContextMenuTitlebar
