import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'

/**
 * Artifacts settings button
 * @constructor
 * @since
 */
export interface IAIArtifactsProps {
  checked: boolean
  onChange: (checked: boolean) => void
}
const ArtifactsToggleButton: FC<IAIArtifactsProps> = (props) => {
  const { checked, onChange } = props
  const { t } = useTranslation(['client', 'common'])
  return (
    <TextOnlyTooltip
      title={
        <Stack>
          <Stack gap={0.5} direction={'row'}>
            <Typography
              fontSize={'16px'}
              color={'rgba(255, 255, 255, .87)'}
              fontWeight={500}
            >
              {'Artifacts'}
            </Typography>
            {/*<Typography fontSize={'16px'} color={'#d9a7ff'} fontWeight={500}>*/}
            {/*  {'search'}*/}
            {/*</Typography>*/}
          </Stack>
          <Typography fontSize={'14px'} color={'rgba(255, 255, 255, .87)'}>
            {t(
              'client:sidebar__search_with_ai__advanced__copilot__description',
            )}
          </Typography>
        </Stack>
      }
    >
      <Stack
        onClick={async () => {
          onChange(!checked)
        }}
        direction={'row'}
        alignItems={'center'}
        gap={0.5}
        sx={{
          py: 0.5,
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
            checked={checked}
            sx={{ width: 32, height: 16, padding: 0 }}
            color='primary'
          />
        </Stack>
        <Typography
          fontSize={'14px'}
          color={checked ? 'primary.main' : 'text.primary'}
        >
          {'Artifacts'}
        </Typography>
      </Stack>
    </TextOnlyTooltip>
  )
}
export { ArtifactsToggleButton }
