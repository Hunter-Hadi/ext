import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import ConversationList from '@/features/chatgpt/components/ConversationList/index'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ConversationListDrawerButton: FC = () => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      setDrawerOpen(open)
    }
  return (
    <>
      <IconButton
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          toggleDrawer(true)(event)
        }}
      >
        <ContextMenuIcon
          sx={{
            fontSize: 28,
          }}
          icon={'Menu'}
        />
      </IconButton>
      <Drawer
        PaperProps={{
          sx: {
            overflow: 'unset',
          },
        }}
        anchor={'left'}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Stack
          role={'presentation'}
          component={'div'}
          onKeyDown={toggleDrawer(false)}
          onClick={toggleDrawer(false)}
          sx={{
            position: 'relative',
            backgroundColor: 'background.paper',
            height: '100%',
            width: 312,
          }}
        >
          {drawerOpen && (
            <IconButton
              sx={{
                position: 'absolute',
                left: '100%',
              }}
              onClick={(event) => {
                toggleDrawer(false)
              }}
            >
              <ContextMenuIcon
                sx={{
                  fontSize: 28,
                }}
                icon={'Close'}
              />
            </IconButton>
          )}
          <ConversationList
            conversationType={currentSidebarConversationType}
            sx={{
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </Stack>
      </Drawer>
    </>
  )
}
export default ConversationListDrawerButton
