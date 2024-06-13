import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import SidebarSamplePrompt from '@/features/onboarding/components/SidebarSamplePrompt'
import HomeViewContentNav from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNav'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface ISidebarHomeViewProps {
  isSettingVariables?: boolean
  sx?: SxProps
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({
  sx,
  isSettingVariables,
}) => {
  const { t } = useTranslation(['client'])
  const { currentSidebarConversationType } = useSidebarSettings()

  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <Stack
      flex={1}
      sx={{
        overflowY: 'auto',
        ...sx,
      }}
    >
      <Stack
        px={2}
        width='100%'
        height='100%'
        // justifyContent='space-between'
        alignItems='center'
        position='relative'
        sx={{
          minHeight: 420,
          // 这么做条件渲染是为了，让 内部组件的 useEffect 可以完整的执行，不会被卸载
          display: currentSidebarConversationType === 'Chat' ? 'flex' : 'none',
        }}
      >
        <Stack alignItems='center' maxWidth={480}>
          <HomeViewContentNav />
        </Stack>

        {currentSidebarConversationType === 'Chat' && (
          <Stack
            justifyContent={'center'}
            alignItems={'center'}
            my={'auto'}
            px={2.5}
            maxWidth={isInMaxAIImmersiveChat ? 'unset' : 502}
          >
            <QuestionAnswerIcon
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
              {t('client:home_view__chat__title')}
            </Typography>
            <Typography
              fontSize={'14px'}
              fontWeight={400}
              textAlign={'center'}
              color={'text.primary'}
            >
              {t('client:home_view__chat__description')}
            </Typography>
          </Stack>
        )}
      </Stack>

      {currentSidebarConversationType === 'Search' && (
        <Stack
          px={2}
          width='100%'
          height='100%'
          justifyContent='center'
          alignItems='center'
          position='relative'
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
          width='100%'
          height='100%'
          justifyContent='center'
          alignItems='center'
          position='relative'
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
            {/* <ResponsiveImage
              width={776}
              height={358}
              sx={{
                mt: 1.5,
              }}
              src={`${getChromeExtensionAssetsURL(
                '/images/art/art-vision.png',
              )}`}
            /> */}
          </Stack>
        </Stack>
      )}

      <Stack
        alignItems='center'
        maxWidth={isInMaxAIImmersiveChat ? 768 : 502}
        mx='auto'
        width='100%'
      >
        <SidebarSamplePrompt isSettingVariables={isSettingVariables} />
      </Stack>
    </Stack>
  )
}

export default SidebarHomeView
