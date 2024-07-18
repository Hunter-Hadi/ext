import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import React from 'react'

import { IAIForSearchStatus } from '@/features/searchWithAI/types'

import SearchWithAILogo from './SearchWithAILogo'
import SearchWithAISettings from './SearchWithAISettings'
import SearchWithAIWebAccessToggle from './SearchWithAIWebAccessToggle'
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
      // {
      //   name: 'settings',
      //   label: '',
      //   icon: <SettingsOutlinedIcon fontSize="inherit" />,
      //   tooltip: 'Settings',
      //   onClick: () => {
      //     chromeExtensionClientOpenPage({
      //       key: 'options',
      //       query: '#/search-with-ai',
      //     })
      //   },
      // },
      {
        name: 'close',
        label: '',
        icon: <CloseIcon fontSize='inherit' />,
        tooltip: '',
        onClick: handleClose,
      },
    ]

    // if (isAnswering) {
    //   return [
    //     {
    //       name: 'stop-generate',
    //       label: 'Stop generating',
    //       icon: <StopOutlinedIcon fontSize="inherit" />,
    //       tooltip: '',
    //       onClick: handleStopGenerate,
    //     },
    //   ]
    // }

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
      direction='row'
      px={2}
      alignItems='center'
      sx={{
        fontSize: 20,
      }}
      py={1}
    >
      <SearchWithAILogo />
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction='row' alignItems='center'>
        {showWebAccess && (
          <SearchWithAIWebAccessToggle
            sx={{
              mr: 1,
            }}
            onChange={handleResetStatus}
          />
        )}
        <SearchWithAISettings />
        {actionsBtn.map((action) => {
          return (
            <Tooltip
              placement='top'
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
                  color='inherit'
                  size='small'
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ) : (
                <IconButton
                  color='inherit'
                  size='small'
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
