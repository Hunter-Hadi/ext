import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import React, { FC, memo, useState } from 'react'

import CustomModal from '@/features/common/components/CustomModal'
import { IContextMenuItem } from '@/features/contextMenu/types'
import ChatContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/ChatContextProvider'
import SettingPromptsContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsContextProvider'
import TabBar from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/TabBar'

import ConfigurePanel from './ConfigurePanel'
import PreviewPanel from './PreviewPanel'
import PromptPanel from './PromptPanel'
import TitleBar from './TitleBar'

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
    <CustomModal
      show={open}
      onClose={onCancel}
      disablePortal={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 'calc(100% - 112px)',
        height: 'calc(100% - 112px)',
        maxWidth: 'auto',
        margin: '56px',
        borderRadius: 2,
      }}
    >
      <SettingPromptsContextProvider
        node={node}
        onSave={onSave}
        onDelete={onDelete}
        onCancel={onCancel}
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
      </SettingPromptsContextProvider>
    </CustomModal>
  )
}
export default memo(SettingPromptsEditFormModal)
