import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import React, { FC, memo, useState } from 'react'

import CustomModal from '@/features/common/components/CustomModal'
import { IContextMenuItem } from '@/features/contextMenu/types'
import SettingPromptsEditConfigurePanel from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/SettingPromptsEditConfigurePanel'
import SettingPromptsEditPreviewPanel from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/SettingPromptsEditPreviewPanel'
import SettingPromptsEditPromptPanel from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/SettingPromptsEditPromptPanel'
import SettingPromptsEditTabBar from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/SettingPromptsEditTabBar'
import SettingPromptsEditTitleBar from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/components/SettingPromptsEditTitleBar'
import SettingPromptsChatContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsChatContextProvider'
import SettingPromptsEditContextProvider from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/SettingPromptsEditContextProvider'
import { SETTINGS_PAGE_CONTENT_WIDTH } from '@/pages/settings/pages/SettingsApp'

const SettingPromptsEditFormModal: FC<{
  iconSetting?: boolean
  node: IContextMenuItem
  onSave?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  onCancel?: () => void
  open: boolean
}> = ({ open, node, onSave, onDelete, onCancel, iconSetting }) => {
  const [tabIndex, setTabIndex] = useState(
    node.id && node.data.type === 'shortcuts' ? 1 : 0,
  )

  return (
    <CustomModal
      show={open}
      onClose={onCancel}
      disablePortal={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        margin: node.data.type === 'shortcuts' ? '56px' : '56px auto',
        width:
          node.data.type === 'shortcuts'
            ? 'calc(100% - 112px)'
            : SETTINGS_PAGE_CONTENT_WIDTH,
        height: 'calc(100% - 112px)',
        maxWidth: 'auto',
        borderRadius: 2,
        bgcolor: 'background.paper',
        backgroundImage: 'none'
      }}
    >
      <SettingPromptsEditContextProvider
        node={node}
        onSave={onSave}
        onDelete={onDelete}
        onCancel={onCancel}
      >
        <SettingPromptsEditTitleBar
          tabIndex={tabIndex}
          changeTabIndex={setTabIndex}
        />
        <Stack direction="row" flex={1} overflow="hidden">
          <Stack flex={1} overflow="auto" p={2}>
            {node.data.type === 'shortcuts' && (
              <SettingPromptsEditTabBar
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
              />
            )}
            {tabIndex === 0 && (
              <SettingPromptsEditConfigurePanel
                iconSetting={iconSetting}
                onNextClick={() => setTabIndex(1)}
              />
            )}
            {tabIndex === 1 && <SettingPromptsEditPromptPanel />}
          </Stack>
          {node.data.type === 'shortcuts' && (
            <>
              <Divider orientation="vertical" sx={{ my: 0 }} />
              <Stack flex={1} overflow="auto">
                <SettingPromptsChatContextProvider>
                  <SettingPromptsEditPreviewPanel />
                </SettingPromptsChatContextProvider>
              </Stack>
            </>
          )}
        </Stack>
      </SettingPromptsEditContextProvider>
    </CustomModal>
  )
}
export default memo(SettingPromptsEditFormModal)
