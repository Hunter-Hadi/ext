import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import {
  MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID,
  MAXAI_SIDEBAR_ID,
} from '@/features/common/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

import HomeViewAISearchInput from './HomeViewAISearchInput'
import HomeViewContentNavIcons from './HomeViewContentNavIcons'
import HomeViewImageUploader from './HomeViewImageUploader'
import HomeViewPdfFUploader from './HomeViewPdfFUploader'

type IHomeViewNavItemValueType =
  | 'immersive_chat'
  | 'one_click_prompts'
  | 'my_own_prompts'

interface IHomeViewNavItem {
  show: boolean
  title: string
  value: IHomeViewNavItemValueType
  onClick?: () => void
}

const HomeViewContentNav = () => {
  const { t } = useTranslation()

  const { currentSidebarConversationType } = useSidebarSettings()

  const inImmersiveChat = useMemo(() => isMaxAIImmersiveChatPage(), [])

  const HOME_VIEW_CONTENT_NAV_CONFIG = useMemo<
    Record<IHomeViewNavItemValueType, IHomeViewNavItem>
  >(() => {
    return {
      immersive_chat: {
        show: !isMaxAIImmersiveChatPage(),
        title: t('client:home_view_content_nav__immersive_chat__title'),
        value: 'immersive_chat',
        onClick: () => {
          if (currentSidebarConversationType !== 'Summary') {
            chromeExtensionClientOpenPage({
              url: Browser.runtime.getURL(`/pages/chat/index.html`),
              query: `#/${currentSidebarConversationType.toLowerCase()}`,
            })
          } else {
            chromeExtensionClientOpenPage({
              url: Browser.runtime.getURL(`/pages/chat/index.html`),
            })
          }
        },
      },
      one_click_prompts: {
        show: true,
        title: t('client:home_view_content_nav__one_click_prompts_title'),
        value: 'one_click_prompts',
        onClick: () => {
          // 临时方案
          // 找到 prompt library button，触发点击事件
          const promptLibraryBtn =
            queryShadowContainerElementSelector<HTMLElement>(
              `#${MAXAI_SIDEBAR_ID}`,
              `#${MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID}`,
            )

          promptLibraryBtn?.click()
        },
      },
      my_own_prompts: {
        show: true,
        title: t('client:home_view_content_nav__my_own_prompts__title'),
        value: 'my_own_prompts',
        onClick: () => {
          chromeExtensionClientOpenPage({
            key: 'options',
            query: '#/my-own-prompts',
          })
        },
      },
    }
  }, [t])

  return (
    <Box py={2}>
      <Grid container spacing={1.5}>
        <Grid item xs={12} order={1} container spacing={1.5}>
          <Grid item xs={6}>
            <HomeViewAISearchInput />
          </Grid>
          <Grid item xs={6}>
            <HomeViewDefaultNavItem
              navItem={HOME_VIEW_CONTENT_NAV_CONFIG['my_own_prompts']}
            />
          </Grid>
        </Grid>
        <Grid item xs={6} order={2} container spacing={1.5}>
          {!inImmersiveChat && (
            <Grid item xs={12}>
              <HomeViewDefaultNavItem
                navItem={HOME_VIEW_CONTENT_NAV_CONFIG['immersive_chat']}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <HomeViewPdfFUploader />
          </Grid>
        </Grid>
        <Grid item xs={6} order={3}>
          <HomeViewImageUploader />
        </Grid>
      </Grid>
    </Box>
  )
}

const HomeViewDefaultNavItem: FC<{
  navItem: IHomeViewNavItem
}> = ({ navItem }) => {
  if (!navItem.show) {
    return null
  }

  const buttonClickedName = `home-view-${navItem.value.replace(
    /_/g,
    '-',
  )}-button`

  return (
    <Stack
      direction={'row'}
      alignItems='center'
      spacing={0.5}
      data-button-clicked-name={buttonClickedName}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          p: 1,
          color: 'text.primary',
          cursor: 'pointer',
          borderRadius: 2,
          // transition: 'all 0.3s ease',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.10)',
          },
        }
      }}
      onClick={() => {
        navItem.onClick && navItem.onClick()
      }}
    >
      <HomeViewContentNavIcons icon={navItem.value} />
      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color='inherit'
      >
        {navItem.title}
      </Typography>
    </Stack>
  )
}

export default HomeViewContentNav
