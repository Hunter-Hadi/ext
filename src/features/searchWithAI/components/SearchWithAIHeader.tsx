import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { FC, useMemo } from 'react'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { chromeExtensionClientOpenPage } from '@/utils'
import { UseChatGptIcon } from '@/components/CustomIcon'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import SearchWithAIWebAccessToggle from './SearchWithAIWebAccessToggle'
import { SEARCH_WITH_AI_LOGO_ID } from '../constants'
import { IAIForSearchStatus } from '../hooks/useSearchWithAICore'
import React from 'react'
interface IProps {
  status: IAIForSearchStatus
  isAnswering: boolean
  handleStopGenerate: () => void
  handleClose: () => void
  handleResetStatus: () => void
}

const SearchWithAIHeader: FC<IProps> = ({
  status,
  isAnswering,
  handleStopGenerate,
  handleClose,
  handleResetStatus,
}) => {
  const actionsBtn = useMemo(() => {
    // if(status === 'paused') {
    //   return [
    //     {
    //       name: 'stop-generate',
    //       label: 'Stop responding',
    //       icon: <DoDisturbOnOutlinedIcon fontSize="inherit" />,
    //       tooltip: '',
    //       onClick: handleStopGenerate,
    //     },
    //   ]
    // }

    const commonActions = [
      {
        name: 'settings',
        label: '',
        icon: <SettingsOutlinedIcon fontSize="inherit" />,
        tooltip: 'Settings',
        onClick: () => {
          chromeExtensionClientOpenPage({
            key: 'options',
            query: '#/search-with-ai',
          })
        },
      },
      {
        name: 'close',
        label: '',
        icon: <CloseIcon fontSize="inherit" />,
        tooltip: '',
        onClick: handleClose,
      },
    ]

    if (isAnswering) {
      return [
        {
          name: 'stop-generate',
          label: 'Stop generating',
          icon: <StopOutlinedIcon fontSize="inherit" />,
          tooltip: '',
          onClick: handleStopGenerate,
        },
      ]
    }

    // if (status === 'success') {
    //   commonActions.push({
    //     name: 're-generate',
    //     label: '',
    //     icon: <StopOutlinedIcon fontSize="inherit" />,
    //     tooltip: 'Regenerate',
    //     onClick: handleReGenerate,
    //   })
    // }

    return commonActions
  }, [isAnswering, handleStopGenerate, handleClose])

  const showWebAccess = useMemo(
    () => !isAnswering && status !== 'waitingAnswer' && status !== 'answering',
    [status, isAnswering],
  )

  return (
    <Stack
      direction="row"
      px={2}
      alignItems="center"
      sx={{
        fontSize: 20,
      }}
      py={1}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        id={SEARCH_WITH_AI_LOGO_ID}
      >
        <UseChatGptIcon
          sx={{
            fontSize: 22,
            color: 'primary.main',
          }}
        />
        <Typography
          component="h6"
          fontSize={16}
          fontWeight={800}
          color="inherit"
        >
          {String(process.env.APP_NAME)}
        </Typography>
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" alignItems="center">
        {showWebAccess && (
          <SearchWithAIWebAccessToggle
            sx={{
              mr: 1,
            }}
            onChange={handleResetStatus}
          />
        )}
        {actionsBtn.map((action) => {
          return (
            <Tooltip
              placement="top"
              PopperProps={{
                disablePortal: true,
              }}
              title={
                action.tooltip ? (
                  <Typography fontSize={12}>{action.tooltip}</Typography>
                ) : (
                  ''
                )
              }
              key={action.name}
            >
              {action.label ? (
                <Button
                  startIcon={action.icon}
                  color="inherit"
                  size="small"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ) : (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={action.onClick}
                  sx={{
                    fontSize: 18,
                  }}
                >
                  {action.icon}
                </IconButton>
              )}
            </Tooltip>
          )
        })}
      </Stack>
    </Stack>
  )
}

export default SearchWithAIHeader
