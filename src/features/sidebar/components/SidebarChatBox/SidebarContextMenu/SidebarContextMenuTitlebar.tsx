import CloseOutlined from '@mui/icons-material/CloseOutlined'
import { buttonClasses, Stack, SxProps, Theme } from '@mui/material'
import Divider from '@mui/material/Divider'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import TooltipIconButton from '@/components/TooltipIconButton'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import LanguageSelector from '@/features/contextMenu/components/FloatingContextMenu/LanguageSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import SidebarHistoryButton from '../SidebarHistoryButton'

const historySx: SxProps<Theme> = {
  color: 'text.secondary',
  padding: '6px',
  borderColor: (t: Theme) => {
    return t.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.16)'
  },
  borderRadius: '8px',
  width: '25px',
  height: '25px',
  '&:hover': {
    color: 'primary.main',
    borderColor: 'primary.main',
  },
}

const historyIconSx: SxProps<Theme> = {
  fontSize: '16px',
}

const SidebarContextMenuTitlebar: FC<{
  isSettingCustomVariable: boolean
  onClose?: VoidFunction
}> = ({ isSettingCustomVariable, onClose }) => {
  const { t } = useTranslation(['common'])
  const { userSettings, setUserSettings } = useUserSettings()

  const isImmersivePage = useMemo(() => isMaxAIImmersiveChatPage(), [])
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
          <SidebarHistoryButton
            sx={{
              ...historySx,
              [`&.${buttonClasses.contained}`]: {
                color: 'white',
              },
            }}
            iconSx={historyIconSx}
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
