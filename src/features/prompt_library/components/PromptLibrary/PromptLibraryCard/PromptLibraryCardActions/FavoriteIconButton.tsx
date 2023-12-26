import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL } from '@/features/common/constants'
import PromptLibraryTooltip from '@/features/prompt_library/components/PromptLibrary/PromptLibraryTooltip'
import useFavoritePrompts from '@/features/prompt_library/hooks/useFavoritePrompts'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'

export const FavoriteIconButton: FC<{
  promptId: string
}> = ({ promptId }) => {
  const {
    addFavoritePromptMutation,
    removeFavoritePromptMutation,
  } = usePromptActions()
  const { t } = useTranslation(['prompt_library'])
  const {
    checkMaxAIChromeExtensionInstall,
    checkAuthSync,
  } = usePromptLibraryAuth()
  const { data } = useFavoritePrompts()
  const favouritePromptIds = useMemo(() => {
    return (data || []).map((prompt) => prompt.id)
  }, [data])
  const isFavorite = useMemo(() => favouritePromptIds.includes(promptId), [
    favouritePromptIds,
    promptId,
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
    () =>
      isFavorite
        ? t('prompt_library:remove_favorite__tooltip')
        : t('prompt_library:add_favorite__tooltip'),
    [isFavorite, t],
  )

  const buttonCom = (
    <IconButton
      size="small"
      onClick={async (event) => {
        event.stopPropagation()
        if (await checkMaxAIChromeExtensionInstall()) {
          if (await checkAuthSync()) {
            if (isFavorite) {
              removeFavoritePromptMutation.mutate(promptId)
            } else {
              addFavoritePromptMutation.mutate(promptId)
            }
          } else {
            window.location.href = `${MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL}/prompts?favoritesId=${promptId}`
          }
        }
      }}
    >
      {addFavoritePromptMutation.isPending ||
      removeFavoritePromptMutation.isPending ? (
        <CircularProgress size={16} />
      ) : (
        <PromptLibraryTooltip title={tooltipTitle}>{Icon}</PromptLibraryTooltip>
      )}
    </IconButton>
  )

  return <>{buttonCom}</>
}
