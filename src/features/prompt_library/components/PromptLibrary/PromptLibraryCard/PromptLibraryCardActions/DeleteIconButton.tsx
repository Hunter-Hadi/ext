import React, { FC, useMemo, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import DeletePromptConfirm from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/DeletePromptConfirm'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import CircularProgress from '@mui/material/CircularProgress'
import useFavoritePrompts from '@/features/prompt_library/hooks/useFavoritePrompts'

const DeleteIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 20 20" sx={props.sx}>
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.66699 14C4.30033 14 3.98644 13.8694 3.72533 13.6083C3.46421 13.3472 3.33366 13.0333 3.33366 12.6667V4H2.66699V2.66667H6.00033V2H10.0003V2.66667H13.3337V4H12.667V12.6667C12.667 13.0333 12.5364 13.3472 12.2753 13.6083C12.0142 13.8694 11.7003 14 11.3337 14H4.66699ZM11.3337 4H4.66699V12.6667H11.3337V4ZM6.00033 11.3333H7.33366V5.33333H6.00033V11.3333ZM8.66699 11.3333H10.0003V5.33333H8.66699V11.3333Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  )
}

export const DeleteIconButton: FC<{
  promptId: string
  promptTitle: string
}> = ({ promptId, promptTitle }) => {
  const {
    deletePromptLibraryCardMutation,
    removeFavoritePromptMutation,
  } = usePromptActions()
  const [deleteConfirmShow, setDeleteConfirmShow] = useState(false)
  const { data } = useFavoritePrompts()
  const favouritePromptIds = useMemo(() => {
    return (data || []).map((prompt) => prompt.id)
  }, [data])
  const isFavorite = useMemo(() => favouritePromptIds.includes(promptId), [
    favouritePromptIds,
    promptId,
  ])

  const handleDeleteConfirm = async () => {
    deletePromptLibraryCardMutation.mutate(promptId)
    if (isFavorite) {
      removeFavoritePromptMutation.mutate(promptId)
    }
    setDeleteConfirmShow(false)
  }
  return (
    <>
      <Tooltip title="Delete Prompt">
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation()
            setDeleteConfirmShow(true)
          }}
        >
          {deletePromptLibraryCardMutation.isPending ||
          removeFavoritePromptMutation.isPending ? (
            <CircularProgress size={16} sx={{ m: '0 auto' }} />
          ) : (
            <DeleteIcon
              sx={{
                // color: 'rgba(0, 0, 0, 0.54)',
                fontSize: 16,
              }}
            />
          )}
        </IconButton>
      </Tooltip>
      <DeletePromptConfirm
        promptTitle={promptTitle}
        loading={deletePromptLibraryCardMutation.isPending}
        show={deleteConfirmShow}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmShow(false)
        }}
      />
    </>
  )
}
