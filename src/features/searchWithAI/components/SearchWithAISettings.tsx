import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useSearchWithAISettings from '@/features/searchWithAI/hooks/useSearchWithAISettings'
import { chromeExtensionClientOpenPage } from '@/utils'

import { TRIGGER_MODE_OPTIONS } from '../constants'

const SearchWithAISettings = () => {
  const { t } = useTranslation(['settings', 'common'])

  const {
    searchWithAISettings,
    setSearchWithAISettings,
  } = useSearchWithAISettings()

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const openOptionsPage = () => {
    chromeExtensionClientOpenPage({
      key: 'options',
      query: '#/search-with-ai',
    })
  }

  return (
    <>
      <Tooltip
        placement="top"
        PopperProps={{
          disablePortal: true,
        }}
        title={<Typography fontSize={12}>{t('common:settings')}</Typography>}
      >
        <IconButton
          color="inherit"
          size="small"
          onClick={handleClick}
          sx={{
            fontSize: 18,
          }}
        >
          <SettingsOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Stack p={2} spacing={1.5} maxWidth={260}>
          <Typography fontSize={16} fontWeight={500}>
            {t('settings:feature__search_with_ai__trigger_mode__title')}
          </Typography>

          {TRIGGER_MODE_OPTIONS.map((option) => {
            const isActive = searchWithAISettings.triggerMode === option.value
            return (
              <Stack
                key={option.value}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  cursor: 'pointer',

                  '&:hover': {
                    borderColor: isActive ? 'primary.main' : '#bb95e9',
                  },
                }}
                onClick={() => {
                  setSearchWithAISettings({
                    triggerMode: option.value,
                  })
                }}
              >
                <Typography fontSize={14} color="text.primary" fontWeight={500}>
                  {t(option.name)}
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  {t(option.desc)}
                </Typography>
              </Stack>
            )
          })}

          <Divider flexItem variant="middle" />

          <Button
            variant="text"
            onClick={openOptionsPage}
            endIcon={<OpenInNewOutlinedIcon />}
            sx={{
              width: 'max-content',
              justifyContent: 'flex-start',
              px: 2,
              color: 'text.primary',
            }}
          >
            {t('common:all_settings')}
          </Button>
        </Stack>
      </Popover>
    </>
  )
}

export default SearchWithAISettings
