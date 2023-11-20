import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import React, { FC, useMemo, useState } from 'react'
import useInitFavoritesPromptIds from '@/features/prompt_library/hooks/useInitFavoritesPromptIds'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
export const FavoriteIconButton: FC<{
  id: string
  onClick: (isFavorite: boolean) => void
  loading: boolean
}> = ({ id, loading, onClick }) => {
  const [buttonLoading] = useState(false)

  const { favoritesPromptIds } = useInitFavoritesPromptIds(false)

  const isFavorite = useMemo(() => favoritesPromptIds.includes(id), [
    favoritesPromptIds,
    id,
  ])

  const iconSx = useMemo(
    () => ({
      fontSize: 16,
    }),
    [],
  )

  const Icon = useMemo(
    () =>
      isFavorite ? (
        <FavoriteOutlinedIcon sx={iconSx} />
      ) : (
        <FavoriteBorderOutlinedIcon sx={iconSx} />
      ),
    [isFavorite, iconSx],
  )

  const tooltipTitle = useMemo(
    () => (isFavorite ? 'Remove from Favorites' : 'Add to Favorites'),
    [isFavorite],
  )

  const buttonCom = (
    <IconButton
      size="small"
      onClick={(event) => {
        event.stopPropagation()
        onClick && onClick(isFavorite)
      }}
    >
      {loading || buttonLoading ? (
        <CircularProgress size={16} />
      ) : (
        <Tooltip title={tooltipTitle}>{Icon}</Tooltip>
      )}
    </IconButton>
  )

  return <>{buttonCom}</>
}
