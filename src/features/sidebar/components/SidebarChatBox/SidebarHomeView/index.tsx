import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import ResponsiveImage from '@/features/common/components/ResponsiveImage'
import HomeViewContentNav from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNav'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

interface ISidebarHomeViewProps {
  sx?: SxProps
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({ sx }) => {
  const { t } = useTranslation(['client'])
  const { currentSidebarConversationType } = useSidebarSettings()

  return (
    <>
      <Stack
        px={2}
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={{
          display: currentSidebarConversationType === 'Chat' ? 'flex' : 'none',
          ...sx,
        }}
      >
        <Stack height="100%" alignItems="center" maxWidth={480}>
          <HomeViewContentNav />
        </Stack>
      </Stack>
      {currentSidebarConversationType === 'Search' && (
        <Stack
          px={2}
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          position="relative"
          sx={sx}
        >
          <Stack justifyContent={'center'} alignItems={'center'}>
            <ContextMenuIcon
              icon={'Search'}
              sx={{
                color: 'primary.main',
                fontSize: '48px',
              }}
            />
            <Typography
              mt={1.5}
              mb={1}
              fontSize={'20px'}
              fontWeight={700}
              textAlign={'center'}
              color={'text.primary'}
            >
              {t('client:home_view__search__title')}
            </Typography>
            <Typography
              fontSize={'14px'}
              fontWeight={400}
              textAlign={'center'}
              color={'text.primary'}
            >
              {t('client:home_view__search__description')}
            </Typography>
          </Stack>
        </Stack>
      )}
      {currentSidebarConversationType === 'Art' && (
        <Stack
          px={2}
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          position="relative"
          sx={sx}
        >
          <Stack
            justifyContent={'center'}
            alignItems={'center'}
            maxWidth={680}
            width={'80%'}
          >
            <ContextMenuIcon
              icon={'Art'}
              sx={{
                color: 'primary.main',
                fontSize: '48px',
              }}
            />
            <Typography
              mt={1.5}
              mb={1}
              fontSize={'20px'}
              fontWeight={700}
              textAlign={'center'}
              color={'text.primary'}
            >
              {t('client:home_view__art__title')}
            </Typography>
            <Typography
              fontSize={'14px'}
              fontWeight={400}
              textAlign={'center'}
              color={'text.primary'}
            >
              {t('client:home_view__art__description')}
            </Typography>
            <ResponsiveImage
              width={776}
              height={358}
              sx={{
                mt: 1.5,
              }}
              src={`${getChromeExtensionAssetsURL(
                '/images/art/art-vision.png',
              )}`}
            />
          </Stack>
        </Stack>
      )}
    </>
  )
}

export default SidebarHomeView
