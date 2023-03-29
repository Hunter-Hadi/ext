import { Box, IconButton, Stack, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { NodeRender } from '@minoru/react-dnd-treeview'
import EditIcon from '@mui/icons-material/Edit'
import { ContextMenuIcon, IContextMenuItem } from '@/features/contextMenu'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import VisibilityIcon from '@mui/icons-material/Visibility'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const ContextMenuItem = (props: {
  disabledDrag?: boolean
  isActive?: boolean
  node: IContextMenuItem
  params: Parameters<NodeRender<IContextMenuItem>>[1]
  onEdit?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
}) => {
  const {
    disabledDrag = false,
    isActive = false,
    node,
    params: { depth, isOpen, onToggle, handleRef },
    onEdit,
    // onDelete,
  } = props
  const isFirstDeep = node.parent === 'root'
  const isGroup = node.data.type === 'group'
  const DRAG_ICON_SIZE = disabledDrag ? -24 : 24
  const [isHover, setIsHover] = useState(false)
  const memoPaddingLeft = useMemo(() => {
    return Math.max(0, depth) * 24 + DRAG_ICON_SIZE
  }, [DRAG_ICON_SIZE])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      height={28}
      sx={{
        position: 'relative',
        background:
          isHover || isActive
            ? 'linear-gradient(0deg, rgba(55, 53, 47, 0.08), rgba(55, 53, 47, 0.08)), #FFFFFF'
            : 'unset',
        borderRadius: '3px',
        pl: memoPaddingLeft + 'px',
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => {
        if (!isFirstDeep && isGroup) {
          onToggle()
        }
      }}
    >
      {node.droppable && !disabledDrag && (
        <Box
          sx={{
            position: 'absolute',
            left: Math.max(0, memoPaddingLeft - DRAG_ICON_SIZE) + 'px',
            flexShrink: 0,
            height: DRAG_ICON_SIZE,
            width: DRAG_ICON_SIZE,
          }}
        >
          {/*<span style={{ position: 'absolute', left: 200 }}>*/}
          {/*  {depth},{memoPaddingLeft},{Math.max(0, memoPaddingLeft - DRAG_ICON_SIZE)}*/}
          {/*</span>*/}
          <div ref={handleRef}>
            <DragIndicatorIcon
              sx={{
                fontSize: DRAG_ICON_SIZE,
                cursor: 'move',
                color: '#00000061',
              }}
            />
          </div>
        </Box>
      )}
      {node.data.icon && (
        <ContextMenuIcon
          icon={node.data.icon}
          sx={{ mr: 1, color: 'primary.main', fontSize: 16 }}
        />
      )}
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={1}
        flex={1}
        width={0}
        sx={{
          height: '100%',
          cursor: isGroup && !isFirstDeep ? 'pointer' : 'default',
        }}
      >
        <Stack
          flex={1}
          width={0}
          direction={'row'}
          alignItems={'center'}
          spacing={1}
          height={'100%'}
          sx={{}}
        >
          {isGroup && isFirstDeep ? (
            <Typography fontSize={12} color={'text.secondary'}>
              {node.text}
            </Typography>
          ) : (
            <Typography
              fontSize={14}
              color={'text.primary'}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}
            >
              {node.text}
            </Typography>
          )}
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          flexShrink={0}
          sx={{
            pl: 2,
            height: '100%',
          }}
        >
          {isGroup &&
            !isFirstDeep &&
            (isOpen ? (
              <KeyboardArrowDownIcon
                sx={{
                  color: 'rgba(55, 53, 47, 0.45)',
                  fontSize: 16,
                  mr: 2,
                }}
              />
            ) : (
              <KeyboardArrowRightIcon
                sx={{
                  fontSize: 16,
                  color: 'rgba(55, 53, 47, 0.45)',
                  mr: 2,
                }}
              />
            ))}
          <IconButton
            size={'small'}
            onClick={(event) => {
              onEdit && onEdit(node)
              event.stopPropagation()
            }}
          >
            {node.data.editable ? (
              <EditIcon sx={{ fontSize: 20 }} />
            ) : (
              <VisibilityIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  )
}
export default ContextMenuItem
