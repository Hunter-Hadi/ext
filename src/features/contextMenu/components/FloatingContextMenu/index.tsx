import { FloatingPortal, useFloatingNodeId } from '@floating-ui/react'
import React, { FC } from 'react'
import { Autocomplete, Box, Stack, TextareaAutosize } from '@mui/material'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import TransitEnterexitIcon from '@mui/icons-material/TransitEnterexit'
import {
  DropdownMenu,
  DropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  return (
    <FloatingPortal root={root}>
      <Box
        component={'div'}
        sx={{
          position: 'absolute',
          zIndex: 9999999,
          top: '20%',
          left: '20%',
          borderRadius: '6px',
          background: 'white',
          boxShadow:
            'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
          overflow: 'hidden',
          isolation: 'isolate',
          width: '400px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          '& textarea': {
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            '&:focus': {
              outline: 'none',
            },
          },
        }}
      >
        <DropdownMenu label="Edit">
          <DropdownMenuItem label="Undo" onClick={() => console.log('Undo')} />
          <DropdownMenuItem label="Redo" disabled />
          <DropdownMenuItem label="Cut" />
          <DropdownMenu label="Copy as">
            <DropdownMenuItem label="Text" />
            <DropdownMenuItem label="Video" />
            <DropdownMenu label="Image">
              <DropdownMenuItem label=".png" />
              <DropdownMenuItem label=".jpg" />
              <DropdownMenuItem label=".svg" />
              <DropdownMenuItem label=".gif" />
            </DropdownMenu>
            <DropdownMenuItem label="Audio" />
          </DropdownMenu>
          <DropdownMenu label="Share">
            <DropdownMenuItem label="Mail" />
            <DropdownMenuItem label="Instagram" />
          </DropdownMenu>
        </DropdownMenu>
        <Autocomplete
          onKeyDown={(event) => {
            event.stopPropagation()
          }}
          onKeyUp={(event) => {
            event.stopPropagation()
          }}
          freeSolo
          fullWidth
          placeholder={'Ask ChatGPT to edit or generate...'}
          renderInput={(params) => (
            <Stack
              direction={'row'}
              spacing={1}
              alignItems={'center'}
              sx={{
                height: 36,
                p: '2px 12px 2px 8px',
              }}
            >
              <ContextMenuIcon
                icon={'AutoAwesome'}
                sx={{ flexShrink: 0, color: 'primary.main' }}
              />
              <TextareaAutosize autoFocus maxRows={1} {...params} />
              <TransitEnterexitIcon
                sx={{ flexShrink: 0, color: 'text.secondary' }}
              />
            </Stack>
          )}
          options={[]}
        />
      </Box>
    </FloatingPortal>
  )
}

export default FloatingContextMenu
