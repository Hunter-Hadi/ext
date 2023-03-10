import Portal from '@/components/Portal'
import React from 'react'
import { Button, Paper, Stack } from '@mui/material'
import { Item, Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
// import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
export const RangyContextMenuId = 'EzMail_AI_ROOT_Context_Menu_ID'
export const RangyGmailToolBarContextMenuId =
  'EzMail_AI_ROOT_Gmail_Toolbar_Context_Menu_ID'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import { useRangy } from '@/features/contextMenu'
import { EzMailAIIcon } from '@/components/CustomIcon'

const RangyContextMenu = () => {
  const { hideRangy, saveSelection } = useRangy()
  const [dropdownType, setDropdownType] = React.useState<
    'ezMailAI' | 'buttons'
  >('buttons')
  return (
    <Portal containerId={'EzMail_AI_ROOT_Context_Menu'}>
      <Paper elevation={3}>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={RangyContextMenuId}
          onVisibilityChange={(isVisible) => {
            if (!isVisible) {
              hideRangy()
              setDropdownType('buttons')
            }
          }}
        >
          {dropdownType === 'buttons' && (
            <Item
              closeOnClick={false}
              onClick={({ event }) => {
                event.stopPropagation()
                event.preventDefault()
                saveSelection()
                setDropdownType('ezMailAI')
              }}
            >
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <Button
                  startIcon={<EzMailAIIcon sx={{ fontSize: 16 }} />}
                  sx={{ width: 110, height: 32 }}
                  size={'small'}
                >
                  EzMail.AI
                </Button>
              </Stack>
            </Item>
          )}
          {dropdownType === 'ezMailAI' && (
            <ContextMenuList
              defaultContextMenuJson={defaultContextMenuJson}
              settingsKey={'contextMenus'}
            />
          )}
        </Menu>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={RangyGmailToolBarContextMenuId}
        >
          <ContextMenuList
            defaultContextMenuJson={defaultGmailToolbarContextMenuJson}
            settingsKey={'gmailToolBarContextMenu'}
          />
        </Menu>
      </Paper>
    </Portal>
  )
}
export { RangyContextMenu }
