import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useMemo } from 'react'
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

const HomeViewContentNav = () => {
  const { t } = useTranslation()

  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()

  const HOME_VIEW_CONTENT_NAV = useMemo<
    {
      show: boolean
      title: string
      value: string
    }[]
  >(() => {
    return [
      {
        show: true,
        title: t('client:home_view_content_nav__one_click_prompts_title'),
        value: 'one_click_prompts',
      },
      {
        show: true,
        title: t('client:home_view_content_nav__my_own_prompts__title'),
        value: 'my_own_prompts',
      },
      {
        show: !isMaxAIImmersiveChatPage(),
        title: t('client:home_view_content_nav__summary__title'),
        value: 'summary',
      },
      {
        show: true,
        title: t('client:home_view_content_nav__chat_with_pdf_title'),
        value: 'chat_with_pdf',
      },
      {
        show: !isMaxAIImmersiveChatPage(),
        title: t('client:home_view_content_nav__immersive_chat__title'),
        value: 'immersive_chat',
      },
    ]
  }, [t])

  const handleClick = (value: string) => {
    if (value === 'one_click_prompts') {
      // 临时方案
      // 找到 prompt library button，触发点击事件
      const promptLibraryBtn = queryShadowContainerElementSelector<HTMLElement>(
        MAXAI_SIDEBAR_ID,
        `#${MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID}`,
      )

      promptLibraryBtn?.click()
    }
    if (value === 'my_own_prompts') {
      chromeExtensionClientOpenPage({
        key: 'options',
        query: '#/my-own-prompts',
      })
    }
    if (value === 'summary') {
      updateSidebarConversationType('Summary')
    }
    if (value === 'chat_with_pdf') {
      chromeExtensionClientOpenPage({
        key: 'pdf_viewer',
        query: '?pdfUrl=&newTab=true',
      })
    }
    if (value === 'ai_provider') {
      // do nothing
    }
    if (value === 'immersive_chat') {
      if (currentSidebarConversationType !== 'Summary') {
        chromeExtensionClientOpenPage({
          url: Browser.runtime.getURL(`/pages/chat/index.html`),
          query: `?conversationType=${currentSidebarConversationType}`,
        })
      } else {
        chromeExtensionClientOpenPage({
          url: Browser.runtime.getURL(`/pages/chat/index.html`),
        })
      }
    }

    return
  }

  return (
    <Box py={2}>
      <Grid container spacing={1.5}>
        <Grid key={'ai-search'} item xs={6}>
          <HomeViewAISearchInput />
        </Grid>
        {HOME_VIEW_CONTENT_NAV.map((navItem) => {
          if (!navItem.show) {
            return null
          }
          return (
            <Grid key={navItem.value} item xs={6}>
              <Stack
                direction={'row'}
                alignItems="center"
                spacing={1}
                sx={(t) => {
                  const isDark = t.palette.mode === 'dark'

                  return {
                    p: 1,
                    color: 'text.primary',
                    cursor: 'pointer',
                    borderRadius: 2,
                    // transition: 'all 0.3s ease-in-out',
                    bgcolor: isDark
                      ? 'rgba(59, 61, 62, 0.60)'
                      : 'rgba(233, 233, 235, 0.60)',

                    '&:hover': {
                      bgcolor: isDark
                        ? 'rgba(59, 61, 62, 0.80)'
                        : 'rgba(233, 233, 235, 0.80)',
                    },
                  }
                }}
                onClick={() => handleClick(navItem.value)}
              >
                <HomeViewContentNavIcons icon={navItem.value} />
                <Typography
                  fontSize={14}
                  fontWeight={400}
                  lineHeight={1.5}
                  color="inherit"
                >
                  {navItem.title}
                </Typography>
              </Stack>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default HomeViewContentNav
