import CloseOutlined from '@mui/icons-material/CloseOutlined'
import { Stack } from '@mui/material'
import Divider from '@mui/material/Divider'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
            // placement='bottom'
            tooltipProps={{
              placement: 'bottom',
            }}
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
      <Stack direction={'row'} gap={'4px'} alignItems={'center'}>
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
          <>
            <Divider orientation='vertical' variant='middle' flexItem />
            <TooltipIconButton
              title={t('common:discard')}
              onClick={onClose}
              sx={{
                width: 'auto',
                height: 20,
                color: 'inherit',
                padding: '3px',
                marginRight: '-3px',
              }}
            >
              <CloseOutlined
                sx={{
                  fontSize: 17,
                }}
              />
            </TooltipIconButton>
          </>
        )}
      </Stack>
    </Stack>
  )
}

export default SidebarContextMenuTitlebar
