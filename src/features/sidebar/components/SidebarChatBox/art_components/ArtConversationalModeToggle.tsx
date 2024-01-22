import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

/**
 * Art页是否开启连续会话
 * @constructor
 * @since 2023-10-26
 */
const ArtConversationalModeToggle: FC = () => {
  const { t } = useTranslation(['client', 'common'])
  const { updateSidebarSettings, sidebarSettings } = useSidebarSettings()
  // TODO - 先隐藏这个开关, 因为不携带历史记录聊天很垃圾 - @huangsong - 2024-01-18
  return null
  return (
    <TextOnlyTooltip
      title={t(
        'client:sidebar__search_with_ai__advanced__copilot__description',
      )}
    >
      <Stack
        onClick={async () => {
          if (sidebarSettings?.art?.isEnabledConversationalMode) {
            await updateSidebarSettings({
              art: {
                isEnabledConversationalMode: false,
              },
            })
          } else {
            await updateSidebarSettings({
              art: {
                isEnabledConversationalMode: true,
              },
            })
          }
        }}
        direction={'row'}
        alignItems={'center'}
        gap={0.5}
        sx={{
          py: '6px',
          px: 1,
          cursor: 'pointer',
          '& .use-chat-gpt-ai--MuiSwitch-switchBase': {
            padding: 0,
            margin: '2px',
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .use-chat-gpt-ai--MuiSwitch-track': {
                backgroundColor: 'primary.main',
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .use-chat-gpt-ai--MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .use-chat-gpt-ai--MuiSwitch-thumb': {
              color: 'primary.main',
              border: '6px solid #fff',
            },
            '&.Mui-disabled .use-chat-gpt-ai--MuiSwitch-thumb': {
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[600],
            },
            '&.Mui-disabled + .use-chat-gpt-ai--MuiSwitch-track': {
              opacity: (theme) => (theme.palette.mode === 'light' ? 0.7 : 0.3),
            },
          },
          '& .use-chat-gpt-ai--MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 12,
            height: 12,
          },
          '& .use-chat-gpt-ai--MuiSwitch-track': {
            borderRadius: 16 / 2,
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
            opacity: 1,
            transition: (theme) =>
              theme.transitions.create(['background-color'], {
                duration: 500,
              }),
          },
        }}
      >
        <Stack alignItems={'center'} justifyContent={'center'} p={'2px'}>
          <Switch
            data-testid={'MaxAIArtConversationalModeToggle'}
            checked={sidebarSettings?.art?.isEnabledConversationalMode}
            sx={{ width: 32, height: 16, padding: 0 }}
            color="primary"
          />
        </Stack>
        <Typography fontSize={'14px'} color={'text.primary'}>
          {t('client:sidebar__search_with_ai__advanced__copilot__title')}
        </Typography>
      </Stack>
    </TextOnlyTooltip>
  )
}
export default ArtConversationalModeToggle