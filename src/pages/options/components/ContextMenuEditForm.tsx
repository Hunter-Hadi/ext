import React, { FC, useEffect, useState } from 'react'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  Button,
  Stack,
  TextareaAutosize,
  TextField,
  Typography,
} from '@mui/material'
import { IContextMenuItem } from '@/features/contextMenu'

const ContextMenuEditForm: FC<{
  node: IContextMenuItem
  onSave?: (newNode: IContextMenuItem) => void
  onCancel?: () => void
}> = ({ node, onSave, onCancel }) => {
  const [editNode, setEditNode] = useState<IContextMenuItem>(() =>
    cloneDeep(node),
  )
  const [template, setTemplate] = useState('')
  const isDisabled = !node.data.editable
  useEffect(() => {
    const cloneNode: IContextMenuItem = cloneDeep(node)
    setEditNode(cloneDeep(node))
    setTemplate(cloneNode.data?.actions?.[0]?.parameters?.template || '')
  }, [node])
  return (
    <Stack spacing={2} p={4} height={'100%'}>
      <Typography variant={'h6'}>
        Edit Menu Item{isDisabled ? '(Read only)' : ''}
      </Typography>
      <TextField
        disabled={isDisabled}
        size={'small'}
        value={editNode.text}
        label={'Menu Name'}
        onChange={(event) => {
          setEditNode((prev) => {
            return {
              ...prev,
              text: event.target.value,
            }
          })
        }}
      />
      {node.data.type === 'shortcuts' && (
        <>
          <Typography variant={'body1'}>Template</Typography>
          <TextareaAutosize
            disabled={isDisabled}
            minRows={10}
            value={template}
            onInput={(event) => {
              setTemplate(event.currentTarget.value)
            }}
          />
        </>
      )}
      <Stack
        direction={'row'}
        mt={'auto!important'}
        mb={0}
        alignItems={'center'}
        spacing={1}
        justifyContent={'center'}
      >
        <Button
          variant={'outlined'}
          onClick={() => {
            onCancel?.()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={isDisabled}
          variant={'contained'}
          onClick={() => {
            if (node.data.type === 'group') {
              onSave?.({
                ...editNode,
                data: {
                  ...editNode.data,
                  actions: [],
                },
              })
            } else {
              onSave?.({
                ...editNode,
                data: {
                  ...editNode.data,
                  actions: [
                    {
                      type: 'RENDER_CHATGPT_PROMPT',
                      parameters: {
                        template,
                      },
                    },
                    {
                      type: 'ASK_CHATGPT',
                      parameters: {},
                    },
                  ],
                },
              })
            }
          }}
        >
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
export default ContextMenuEditForm
