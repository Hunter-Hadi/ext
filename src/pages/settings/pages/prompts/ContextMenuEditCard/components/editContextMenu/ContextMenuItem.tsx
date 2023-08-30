import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useMemo, useState } from 'react'
import { NodeRender } from '@minoru/react-dnd-treeview'
import { ContextMenuIcon } from '@/features/contextMenu'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IContextMenuItem } from '@/features/contextMenu/types'
import ContextMenuItemPreviewTooltip from '@/pages/settings/pages/prompts/ContextMenuEditCard/components/editContextMenu/ContextMenuItemPreviewTooltip'
import { useTranslation } from 'react-i18next'
import { PRESET_PROMPT_ID } from '@/pages/settings/pages/prompts/ContextMenuEditCard'
const ContextMenuItem = (props: {
  disabledDrag?: boolean
  isActive?: boolean
  node: IContextMenuItem
  params: Parameters<NodeRender<IContextMenuItem>>[1]
  onEdit?: (node: IContextMenuItem) => void
  onDelete?: (id: string) => void
  isDropTarget?: boolean
}) => {
  const { t } = useTranslation(['settings', 'common', 'prompt'])
  const {
    isDropTarget = false,
    disabledDrag = false,
    isActive = false,
    node,
    params: { depth, isOpen, onToggle, handleRef },
    onEdit,
    // onDelete,
  } = props
  const isPresetPromptItem = node.id === PRESET_PROMPT_ID
  const isFirstDeep = node.parent === 'root'
  const isGroup = node.data.type === 'group' || isPresetPromptItem
  const DRAG_ICON_SIZE = 24
  const [isHover, setIsHover] = useState(false)
  const memoPaddingLeft = useMemo(() => {
    return Math.max(0, depth) * 24 + DRAG_ICON_SIZE
  }, [DRAG_ICON_SIZE])
  const nodeI18nText = useMemo(() => {
    const key: any = `prompt:${node.id}`
    if (t(key) !== node.id) {
      return t(key)
    }
    return node.text
  }, [node, t])
  return (
    <ContextMenuItemPreviewTooltip item={node}>
      <Stack
        direction={'row'}
        alignItems={'center'}
        className={isDropTarget ? 'dragTarget' : ''}
        height={28}
        sx={{
          position: 'relative',
          cursor: isGroup ? 'pointer' : 'default',
          bgcolor: (t) =>
            isHover || isActive
              ? t.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(55, 53, 47, 0.08)'
              : 'unset',
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
                    color: 'inherit',
                  }}
                />
              </div>
            ) : (
              <div
                ref={handleRef}
                style={{
                  zIndex: -1,
                  userSelect: 'none',
                  opacity: 0,
                  width: 1,
                  height: 1,
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
              color: isPresetPromptItem ? 'text.secondary' : 'inherit',
            }}
          />
        )}
        {node.data.icon && (
          <ContextMenuIcon
            icon={node.data.icon}
            sx={{
              mr: 1,
              flexShrink: 0,
              fontSize: 16,
            }}
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
                {nodeI18nText}
              </Typography>
            ) : (
              <Typography
                fontSize={14}
                color={isPresetPromptItem ? 'text.secondary' : 'text.primary'}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}
              >
                {nodeI18nText}
              </Typography>
            )}
          </Stack>
          {
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
                TooltipProps={{
                  placement: 'left',
                  arrow: true,
                }}
                title={t(
                  node.data.editable
                    ? 'settings:feature_card__prompts__tooltip_edit_title'
                    : 'settings:feature_card__prompts__tooltip_read_only_title',
                )}
                size={'small'}
                onClick={(event) => {
                  if (isPresetPromptItem) {
                    return
                  }
                  onEdit && onEdit(node)
                  event.stopPropagation()
                }}
              >
                {node.data.editable ? (
                  <ContextMenuIcon icon={'DefaultIcon'} sx={{ fontSize: 20 }} />
                ) : (
                  <ContextMenuIcon icon={'Lock'} sx={{ fontSize: 20 }} />
                )}
              </TooltipIconButton>
            </Stack>
          }
        </Stack>
      </Stack>
    </ContextMenuItemPreviewTooltip>
  )
}
export default ContextMenuItem
