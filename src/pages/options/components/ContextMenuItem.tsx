import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { IconButton, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { NodeRender } from '@minoru/react-dnd-treeview'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ContextMenuIcon, IContextMenuItem } from '@/features/contextMenu'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'

const ContextMenuItem = (props: {
  isActive?: boolean
  node: IContextMenuItem
  params: Parameters<NodeRender<IContextMenuItem>>[1]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) => {
  const {
    isActive = false,
    node,
    params: { depth, isOpen, onToggle },
    onEdit,
    onDelete,
  } = props
  const [isHover, setIsHover] = useState(false)
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      height={32}
      sx={{
        position: 'relative',
        background: isActive
          ? 'linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), #FFFFFF'
          : 'unset',
        pl: depth * 10 + (node.data.type === 'group' ? 0 : 24) + 'px',
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {node.data.type !== 'group' &&
        node.droppable &&
        (isActive || isHover) && (
          <DragIndicatorIcon
            sx={{
              position: 'absolute',
              left: 0,
              fontSize: 24,
              cursor: 'move',
              flexShrink: 0,
              color: '#00000061',
            }}
          />
        )}
      {node.data.type === 'group' &&
        (isOpen ? (
          <ArrowDropDownIcon
            sx={{ fontSize: 24, cursor: 'pointer', flexShrink: 0 }}
            onClick={onToggle}
          />
        ) : (
          <ArrowRightIcon
            sx={{ fontSize: 24, cursor: 'pointer', flexShrink: 0 }}
            onClick={onToggle}
          />
        ))}
      {node.data.icon && (
        <ContextMenuIcon icon={node.data.icon} sx={{ mr: 1 }} />
      )}
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={1}
        flex={1}
        width={0}
        sx={{
          cursor: node.droppable ? 'default' : 'pointer',
        }}
      >
        <Typography fontSize={14} color={'text.primary'}>
          {node.text}
        </Typography>
        {isHover && (
          <>
            <IconButton
              size={'small'}
              onClick={() => {
                onEdit && onEdit(node.id as string)
              }}
            >
              {node.data.editable ? (
                <EditIcon sx={{ fontSize: 20 }} />
              ) : (
                <VisibilityIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            {node.data.type === 'shortcuts' && node.data.editable && (
              <IconButton
                size={'small'}
                onClick={() => {
                  onDelete && onDelete(node.id as string)
                }}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </>
        )}
      </Stack>
    </Stack>
  )
}
export default ContextMenuItem
