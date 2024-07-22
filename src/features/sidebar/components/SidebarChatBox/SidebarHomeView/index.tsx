import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { throttle } from '@/features/common/hooks/useThrottle'
import SidebarSamplePrompt from '@/features/onboarding/components/SidebarSamplePrompt'
import HomeViewContentNav from '@/features/sidebar/components/SidebarChatBox/SidebarHomeView/HomeViewContentNav'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import SidebarContextMenu from '../SidebarContextMenu'

interface ISidebarHomeViewProps {
  isSettingVariables?: boolean
  sx?: SxProps
  isShowChatBoxHomeView: boolean
}

const SidebarHomeView: FC<ISidebarHomeViewProps> = ({
  sx,
  isSettingVariables,
  isShowChatBoxHomeView,
}) => {
  const { t } = useTranslation(['client'])
  const { currentSidebarConversationType, currentSidebarConversationId } =
    useSidebarSettings()
  const homeViewRef = useRef<HTMLDivElement | null>(null)
  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()

  // 浏览器窗口大小变化的时候，滚动到底部
  useEffect(() => {
    const handleScrollToBottom = throttle(() => {
      if (homeViewRef.current) {
        homeViewRef.current.scrollTo({
          top: homeViewRef.current.scrollHeight,
        })
      }
    }, 100)
    window.addEventListener('resize', handleScrollToBottom)
    return () => {
      window.removeEventListener('resize', handleScrollToBottom)
    }
  }, [])

  return (
    <Stack
      component={'div'}
      ref={homeViewRef}
      flex={1}
      sx={{
        overflowY: 'auto',
        ...sx,
      }}
    >
      {currentSidebarConversationType === 'ContextMenu' && (
        <Stack
          direction={'column'}
          sx={{
            width: '100%',
            padding: '32px 10px',
          }}
        >
          <Stack
            direction={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            sx={{
              height: '175px',
            }}
          >
            <ContextMenuIcon
              icon='Rewrite'
              sx={{
                color: 'rgb(144, 101, 176)',
                fontSize: '40px',
                marginBottom: '12px',
              }}
            />

            <Typography
              marginBottom={'8px'}
              lineHeight={'140%'}
              fontWeight={700}
              fontSize={20}
              textAlign={'center'}
              color={(t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.87)'
                  : 'rgba(0, 0, 0, 0.87)'
              }
            >
              {t('client:home_view__rewrite__title')}
            </Typography>

            <Typography
              lineHeight={'150%'}
              fontSize={14}
              textAlign={'center'}
              color={(t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.87)'
                  : 'rgba(0, 0, 0, 0.60)'
              }
            >
              {t('client:home_view__rewrite__description')}
            </Typography>
          </Stack>
          {isShowChatBoxHomeView && (
            // 每次消失直接销毁组件了
            <SidebarContextMenu key={currentSidebarConversationId} />
          )}
        </Stack>
      )}

      <Stack
        px={2}
        width='100%'
        height='100%'
        // justifyContent='space-between'
        alignItems='center'
        position='relative'
        sx={{
          minHeight: 450,
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
        maxWidth={768}
        mx='auto'
        width='100%'
        p={1.5}
        gap={1.5}
      >
        <SidebarSamplePrompt isSettingVariables={isSettingVariables} />
      </Stack>
    </Stack>
  )
}

export default SidebarHomeView
