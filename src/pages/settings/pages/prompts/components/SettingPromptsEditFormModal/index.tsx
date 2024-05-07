import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import React, { FC, memo, useState } from 'react'

import { IContextMenuItem } from '@/features/contextMenu/types'
import ChatContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/ChatContextProvider'
import SettingPromptsContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import TabBar from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/TabBar'

import ConfigurePanel from './ConfigurePanel'
import PreviewPanel from './PreviewPanel'
import PromptPanel from './PromptPanel'
import TitleBar from './TitleBar'
import Divider from '@mui/material/Divider'

const SettingPromptsEditFormModal: FC<{
  iconSetting?: boolean
  node: IContextMenuItem
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
  open: boolean
}> = ({ open, node, onSave, onDelete, onCancel, iconSetting }) => {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Modal open={open} onClose={onCancel} sx={{ p: 4 }}>
      <SettingPromptsContextProvider
        node={node}
        onSave={onSave}
        onDelete={onDelete}
        onCancel={onCancel}
      >
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            bgcolor: 'background.paper',
            maxWidth: '100%!important',
            width: '100%',
            height: '100%',
            p: '0!important',
          }}
        >
          <TitleBar />
          <Stack direction="row" flex={1} overflow="hidden">
            <Stack flex={1} overflow="auto" p={2}>
              <TabBar
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
              />
              {tabIndex === 0 && (
                <>
                  <ConfigurePanel />
                  <Box mt={2}>
                    <Button variant="contained" onClick={() => setTabIndex(1)}>
                      Next: Add prompt
                    </Button>
                  </Box>
                </>
              )}
              {tabIndex === 1 && <PromptPanel />}
            </Stack>
            <Divider orientation="vertical" sx={{ my: 0 }} />
            <Stack flex={1} overflow="auto">
              <ChatContextProvider>
                <PreviewPanel />
              </ChatContextProvider>
            </Stack>
          </Stack>
        </Container>
      </SettingPromptsContextProvider>
    </Modal>
  )
}
export default memo(SettingPromptsEditFormModal)
