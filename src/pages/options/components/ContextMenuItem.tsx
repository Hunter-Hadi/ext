import { Box, Stack, Typography } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { NodeRender } from '@minoru/react-dnd-treeview'
import { ContextMenuIcon, IContextMenuItem } from '@/features/contextMenu'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import TooltipIconButton from '@/components/TooltipIconButton'
const ContextMenuItem = (props: {
  disabledDrag?: boolean
  isActive?: boolean
  node: IContextMenuItem
  params: Parameters<NodeRender<IContextMenuItem>>[1]
  onEdit?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  isDropTarget?: boolean
}) => {
  const {
    isDropTarget = false,
    disabledDrag = false,
    isActive = false,
    node,
    params: { depth, isOpen, onToggle, handleRef },
    onEdit,
    // onDelete,
  } = props
  const isFirstDeep = node.parent === 'root'
  const isGroup = node.data.type === 'group'
  const DRAG_ICON_SIZE = 24
  const [isHover, setIsHover] = useState(false)
  const memoPaddingLeft = useMemo(() => {
    return Math.max(0, depth) * 24 + DRAG_ICON_SIZE
  }, [DRAG_ICON_SIZE])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      className={isDropTarget ? 'dragTarget' : ''}
      height={28}
      sx={{
        position: 'relative',
        cursor: isGroup ? 'pointer' : 'default',
        backgroundColor: isHover || isActive ? 'rgba(0, 0, 0, 0.04)' : 'unset',
        borderRadius: '3px',
        pl: memoPaddingLeft + 'px',
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => {
        if (isGroup) {
          onToggle()
        }
      }}
    >
      {node.droppable && (
        <Box
          sx={{
            position: 'absolute',
            left: Math.max(0, memoPaddingLeft - DRAG_ICON_SIZE) + 'px',
            flexShrink: 0,
            height: DRAG_ICON_SIZE,
            width: DRAG_ICON_SIZE,
            opacity: disabledDrag ? 0 : 1,
          }}
        >
          {/*<span style={{ position: 'absolute', left: 200 }}>*/}
          {/*  {depth},{memoPaddingLeft},{Math.max(0, memoPaddingLeft - DRAG_ICON_SIZE)}*/}
          {/*</span>*/}
          {node.data.editable ? (
            <div ref={handleRef}>
              <DragIndicatorIcon
                sx={{
                  fontSize: DRAG_ICON_SIZE,
                  cursor: 'move',
                  color: '#00000061',
                }}
              />
            </div>
          ) : (
            <DragIndicatorIcon
              sx={{
                fontSize: DRAG_ICON_SIZE,
                cursor: 'default',
                color: 'rgba(0,0,0,0.0)',
              }}
            />
          )}
        </Box>
      )}
      {isGroup && (
        <ExpandCircleDownIcon
          sx={{
            mr: 1,
            flexShrink: 0,
            transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)',
            fontSize: 20,
            color: 'rgba(0,0,0,.87)',
          }}
        />
      )}
      {node.data.icon && (
        <ContextMenuIcon
          icon={node.data.icon}
          sx={{ mr: 1, flexShrink: 0, color: 'primary.main', fontSize: 16 }}
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
          <TooltipIconButton
            tooltipProps={{
              placement: 'right',
            }}
            title={node.data.editable ? 'Edit' : 'Read only'}
            size={'small'}
            onClick={(event) => {
              onEdit && onEdit(node)
              event.stopPropagation()
            }}
          >
            {node.data.editable ? (
              <ContextMenuIcon
                icon={'DefaultIcon'}
                sx={{ color: 'rgba(0,0,0,.87)', fontSize: 20 }}
              />
            ) : (
              <ContextMenuIcon
                icon={'Lock'}
                sx={{ color: 'rgba(0,0,0,.38)', fontSize: 20 }}
              />
            )}
          </TooltipIconButton>
        </Stack>
      </Stack>
    </Stack>
  )
}
export default ContextMenuItem
