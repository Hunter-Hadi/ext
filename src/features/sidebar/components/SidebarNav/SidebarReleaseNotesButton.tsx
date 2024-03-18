import CloseIcon from '@mui/icons-material/Close'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import Divider from '@mui/material/Divider'
import Drawer, { drawerClasses } from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import IframeBox from '@/components/IframeBox'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { WWW_PROJECT_HOST } from '@/constants'

const SidebarReleaseNotesButton = () => {
  const theme = useTheme()
  const { t } = useTranslation(['common'])

  const [releaseModalOpen, setReleaseModalOpen] = React.useState(false)

  const releaseNotesSrc = useMemo(() => {
    const colorParams = {
      bgcolor: theme.palette.background.paper,
      divider: theme.palette.divider,
      color: theme.palette.text.primary,
    }

    const colorParamsStr = new URLSearchParams(colorParams).toString()

    return `${WWW_PROJECT_HOST}/release-notes?${colorParamsStr}`
  }, [theme])

  const handleReleaseModalClose = () => {
    setReleaseModalOpen(false)
  }

  return (
    <>
      {/* release btn */}
      <TextOnlyTooltip title={t('common:release_notes')} placement="left">
        <IconButton
          data-testid={`maxai--sidebar--release_notes--button`}
          sx={{ flexShrink: 0, width: 'max-content' }}
          onClick={() => {
            setReleaseModalOpen(true)
          }}
        >
          <NotificationsNoneOutlinedIcon
            sx={{
              fontSize: '20px',
            }}
          />
        </IconButton>
      </TextOnlyTooltip>

      <Drawer
        keepMounted
        anchor={'bottom'}
        open={releaseModalOpen}
        onClose={handleReleaseModalClose}
        sx={{
          position: 'absolute',
          [`& .${drawerClasses.paper}`]: {
            position: 'absolute',
            borderTopRightRadius: 8,
            borderTopLeftRadius: 8,
            minHeight: '80vh',
            bgcolor: 'background.paper',
            backgroundImage: 'unset',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              position: 'absolute',
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          px={2}
          py={2.5}
          position="relative"
        >
          <IconButton
            onClick={handleReleaseModalClose}
            size="small"
            sx={{
              position: 'absolute',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            fontSize={16}
            fontWeight={500}
            lineHeight={2}
            flex={1}
            textAlign={'center'}
          >
            {t('common:release_notes')}
          </Typography>
        </Stack>
        <Divider />
        <IframeBox
          src={releaseNotesSrc}
          sx={{
            height: 0,
            flex: 1,
          }}
        />
      </Drawer>
    </>
  )
}

export default SidebarReleaseNotesButton
