import { Stack } from '@mui/material'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import LanguageSelector from '@/features/contextMenu/components/FloatingContextMenu/LanguageSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import SidebarContextMenuHistoryButton from './SidebarContextMenuHistoryButton'

const SidebarContextMenuTitlebar: FC<{
  isSettingCustomVariable: boolean
  onClose?: VoidFunction
}> = ({ isSettingCustomVariable, onClose }) => {
  const { t } = useTranslation(['common'])
  const { userSettings, setUserSettings } = useUserSettings()

  const isImmersivePage = useMemo(() => isMaxAIImmersiveChatPage(), [])
  const showModelSelector = true
  /**
   * 优先使用contextmenu的root，防止被contextmenu覆盖
   */
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
          defaultValue={userSettings?.language}
          onChangeLanguage={(lang) => {
            setUserSettings({
              ...userSettings,
              language: lang,
            })
          }}
          placement='bottom-start'
          inSidebar
        />
      </Stack>

      {/* immersive chat 中就不显示了 */}
      <Stack direction={'row'} gap={'4px'}>
        {!isImmersivePage && (
          <SidebarContextMenuHistoryButton
            container={container}
            TooltipProps={{
              placement: 'top',
              floatingMenuTooltip: false,
            }}
          />
        )}

        {isSettingCustomVariable && (
          <TooltipIconButton
            title={t('common:discard')}
            onClick={onClose}
            sx={{
              height: '28px',
              width: '28px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
            }}
          >
            <ContextMenuIcon icon='Close' />
          </TooltipIconButton>
        )}
      </Stack>
    </Stack>
  )
}

export default SidebarContextMenuTitlebar
