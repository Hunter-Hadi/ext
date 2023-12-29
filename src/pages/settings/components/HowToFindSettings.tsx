import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import CloseAlert from '@/components/CloseAlert'

const HowToFindSettings: FC<{
  liteMode?: boolean
}> = ({ liteMode }) => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <>
      {liteMode ? (
        <Box
          sx={{
            borderRadius: '4px',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgb(7, 19, 24)'
                : 'rgb(229, 246, 253)',
            color: (t) =>
              t.palette.mode === 'dark'
                ? 'rgb(184, 231, 251)'
                : 'rgb(1, 67, 97)',
            p: 2,
            overflow: 'hidden',
          }}
        >
          <Stack spacing={1} alignItems={'center'}>
            <Typography fontSize={14} color={'text.primary'}>
              {t(
                'client:floating_menu__button__hide_menu__this_site__tooltip__description',
              )}
            </Typography>
            <img
              src={`https://www.maxai.me/assets/chrome-extension/settings-entry-small.png`}
              alt="settings-entry"
              width={200}
              height={80}
            />
          </Stack>
        </Box>
      ) : (
        <CloseAlert
          icon={<></>}
          sx={{
            // bgcolor: '#E2E8F0',
            mt: 1,
            mb: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography fontSize={14} color={'text.primary'}>
              {t(
                'client:floating_menu__button__hide_menu__this_site__tooltip__description',
              )}
            </Typography>
            <img
              src={`https://www.maxai.me/assets/chrome-extension/settings-entry.png`}
              alt="settings-entry"
              width={466}
              height={121}
            />
          </Stack>
        </CloseAlert>
      )}
    </>
  )
}
export default HowToFindSettings
