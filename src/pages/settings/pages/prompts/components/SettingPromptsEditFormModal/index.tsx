import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import { cloneDeep } from 'lodash-es'
import React, { FC, memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'
import ChatContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/ChatContextProvider'
import { SettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/context'
import TabBar from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/TabBar'

import ConfigurePanel from './ConfigurePanel'
import PreviewPanel from './PreviewPanel'
import PromptPanel from './PromptPanel'
import TitleBar from './TitleBar'

const SettingPromptsEditFormModal: FC<{
  iconSetting?: boolean
  node: IContextMenuItem
  onSave?: (newNode: IContextMenuItem) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  open: boolean
}> = ({ open, node, onSave, onCancel, onDelete, iconSetting }) => {
  const { t } = useTranslation(['settings', 'common'])

  const [tabIndex, setTabIndex] = useState(0)
  const [editNode, setEditNode] = useState(cloneDeep(node))
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey>()

  return (
    <Modal open={open} onClose={onCancel} sx={{ p: 4 }}>
      <SettingPromptsContext.Provider
        value={{ editNode, selectedIcon, setEditNode, setSelectedIcon }}
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
            <Stack flex={1} overflow="auto">
              <ChatContextProvider>
                <PreviewPanel />
              </ChatContextProvider>
            </Stack>
          </Stack>
        </Container>
      </SettingPromptsContext.Provider>
    </Modal>
  )
}
export default memo(SettingPromptsEditFormModal)
