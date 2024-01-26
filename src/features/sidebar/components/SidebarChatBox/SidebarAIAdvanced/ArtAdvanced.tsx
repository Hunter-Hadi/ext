import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import ArtTextToImageAspectRatioSelector from '@/features/sidebar/components/SidebarChatBox/art_components/ArtTextToImageAspectRatioSelector'
import ArtTextToImageContentTypeSelector from '@/features/sidebar/components/SidebarChatBox/art_components/ArtTextToImageContentTypeSelector'

const SearchAdvanced = () => {
  const { t } = useTranslation(['client'])
  return (
    <Stack spacing={1}>
      <Stack direction={'row'} mb={1}>
        <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
          {t('client:art__text_to_image__advanced__title')}
        </Typography>
      </Stack>
      <Stack spacing={2} width={'100%'}>
        <ArtTextToImageAspectRatioSelector />
        <ArtTextToImageContentTypeSelector />
      </Stack>
    </Stack>
  )
}

export default SearchAdvanced
