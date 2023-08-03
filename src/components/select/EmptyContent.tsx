import SearchIcon from '@mui/icons-material/Search'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

const EmptyContent: FC<{
  emptyText?: string
}> = ({ emptyText }) => {
  const { t } = useTranslation(['common'])
  return (
    <Stack alignItems={'center'}>
      <Stack
        width={'56px'}
        height={'56px'}
        justifyContent={'center'}
        alignItems={'center'}
        borderRadius={4}
        sx={{
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, .04)'
              : 'rgba(0, 0, 0, .04)',
        }}
      >
        <SearchIcon width={24} height={24} />
      </Stack>
      <Typography variant={'body1'}>
        {emptyText || t('common:no_options')}
      </Typography>
    </Stack>
  )
}
export default EmptyContent
