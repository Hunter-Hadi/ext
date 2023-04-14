import { Box, Button, Stack, Typography } from '@mui/material'
import CloseAlert from '@/components/CloseAlert'
import { chromeExtensionClientOpenPage } from '@/utils'
import React, { FC } from 'react'

const ManageShortcutHelper: FC<{
  shortCutKey?: string
}> = ({ shortCutKey }) => {
  return (
    <Stack spacing={2}>
      <Stack direction={'row'}>
        <Box
          sx={{
            backgroundColor: 'rgba(98,98,105,1)',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden',
            display: 'grid',
          }}
          component={'div'}
        >
          <Typography
            fontSize={'24px'}
            fontWeight={'bold'}
            color={'#fff'}
            noWrap
            sx={{ px: '10px', py: '4px' }}
          >
            {shortCutKey || 'Shortcut not set'}
          </Typography>
        </Box>
      </Stack>
      {!shortCutKey && (
        <CloseAlert
          icon={<></>}
          sx={{
            // bgcolor: '#E2E8F0',
            mt: 1,
            mb: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography fontSize={14}>
              If the settings page for shortcuts indicates that the Cmd/Alt+J
              shortcut has already been set for UseChatGPT.AI extension, please
              perform a force reconfiguration of the Cmd/Alt+J shortcut as
              instructed in the video.
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: '470px',
                height: '162.5px',
              }}
            >
              <video
                width={'100%'}
                height={'100%'}
                muted
                loop
                autoPlay
                src={`https://www.usechatgpt.ai/assets/installed/reconfigure.mp4`}
              />
            </Box>
          </Stack>
        </CloseAlert>
      )}
      <Button
        sx={{ width: 160 }}
        variant={'contained'}
        color={'primary'}
        onClick={() => {
          chromeExtensionClientOpenPage({ key: 'shortcuts' })
        }}
      >
        {shortCutKey ? 'Change shortcut' : 'Set up shortcut'}
      </Button>
    </Stack>
  )
}
export default ManageShortcutHelper
