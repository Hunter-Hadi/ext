import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { AIChipIcon, MagicBookIcon } from '@/components/CustomIcon'
import {
  MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID,
  MAXAI_SIDEBAR_ID,
} from '@/features/common/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { queryShadowContainerElementSelector } from '@/utils/elementHelper'

const HomeViewContentNav = () => {
  const { t } = useTranslation()

  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()

  const HOME_VIEW_CONTENT_NAV = useMemo(() => {
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
      // {
      //   show: true,
      //   title: t('client:home_view_content_nav__chat_with_pdf_title'),
      //   value: 'chat_with_pdf',
      //   desc: (
      //     <>
      //       {t('client:home_view_content_nav__chat_with_pdf__desc1')}
      //       {` `}
      //       <u>{t('client:home_view_content_nav__upload')}</u>
      //     </>
      //   ),
      // },
      {
        show: true,
        title: t('client:home_view_content_nav__ai_provider__title'),
        value: 'ai_provider',
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
      // do nothing
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
    <Box>
      <Grid container spacing={1.5}>
        {HOME_VIEW_CONTENT_NAV.map((navItem) => {
          if (!navItem.show) {
            return null
          }
          return (
            <Grid key={navItem.value} item xs={6}>
              <Stack
                justifyContent="center"
                alignItems="center"
                sx={(t) => {
                  const isDark = t.palette.mode === 'dark'

                  return {
                    minHeight: 120,
                    color: 'text.primary',
                    cursor:
                      navItem.value === 'ai_provider' ? 'auto' : 'pointer',
                    borderRadius: 2,
                    bgcolor: isDark
                      ? 'rgba(59, 61, 62, 0.60)'
                      : 'rgba(233, 233, 235, 0.60)',
                  }
                }}
                onClick={() => handleClick(navItem.value)}
              >
                <HomeViewContentNavIcons icon={navItem.value} />
                <Typography
                  fontSize={16}
                  fontWeight={500}
                  lineHeight={1.5}
                  color="inherit"
                  mt={0.5}
                >
                  {navItem.title}
                </Typography>
                {navItem.desc && (
                  <Typography fontSize={14} lineHeight={1.5} color="inherit">
                    {navItem.desc}
                  </Typography>
                )}
              </Stack>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default HomeViewContentNav

const HomeViewContentNavIcons: FC<{ icon: string }> = ({ icon }) => {
  const sxMemo = useMemo(
    () => ({
      fontSize: 28,
      color: 'inherit',
    }),
    [],
  )

  const renderIcon = () => {
    if (icon === 'one_click_prompts') {
      return <MagicBookIcon sx={sxMemo} />
    }

    if (icon === 'my_own_prompts') {
      return <SettingsOutlinedIcon sx={sxMemo} />
    }

    if (icon === 'summary') {
      return <SummarizeOutlinedIcon sx={sxMemo} />
    }

    if (icon === 'chat_with_pdf') {
      return (
        <SvgIcon sx={sxMemo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 41"
            fill="none"
          >
            <path
              d="M0 7.54362C0 3.86172 2.98477 0.876953 6.66667 0.876953H33.3333C37.0152 0.876953 40 3.86172 40 7.54362V34.2103C40 37.8922 37.0152 40.877 33.3333 40.877H6.66667C2.98477 40.877 0 37.8922 0 34.2103V7.54362Z"
              fill="white"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.446 27.381C14.6062 27.6292 14.8251 27.8398 15.1143 27.9543C15.4057 28.0696 15.7014 28.0608 15.9654 27.9878C16.4584 27.8517 16.913 27.4741 17.2991 27.0593C17.8218 26.4978 18.3519 25.7206 18.834 24.8602C19.1988 24.7558 19.5763 24.661 19.9579 24.578C20.3779 24.4867 20.7951 24.4115 21.1983 24.3539C21.7761 24.9267 22.372 25.4159 22.9305 25.7375C23.3971 26.0062 23.9414 26.2192 24.4717 26.1532C24.7547 26.1179 25.0242 26.0036 25.249 25.7958C25.4682 25.5932 25.6134 25.331 25.7057 25.0448C25.7952 24.7676 25.8205 24.4727 25.7389 24.1827C25.6565 23.8902 25.4817 23.6611 25.2705 23.4908C24.8744 23.1714 24.3156 23.0289 23.7689 22.9653C23.164 22.8949 22.4456 22.908 21.6851 22.9842C21.4597 22.7395 21.2357 22.4793 21.0176 22.2087C20.7858 21.921 20.5656 21.6277 20.362 21.336C20.5761 20.6435 20.7245 19.9776 20.776 19.3938C20.8264 18.8214 20.7947 18.2199 20.539 17.7493C20.403 17.499 20.2003 17.2809 19.9198 17.1423C19.6432 17.0056 19.3389 16.9698 19.0344 17.0003C18.7452 17.0293 18.4633 17.1215 18.2289 17.3106C17.9903 17.5029 17.8494 17.7564 17.7808 18.0214C17.6532 18.5151 17.767 19.0789 17.9437 19.588C18.1515 20.1865 18.4994 20.8563 18.9269 21.5285C18.7649 21.9828 18.5737 22.4522 18.3604 22.9188C18.2276 23.2094 18.0881 23.4947 17.9443 23.7705C17.1146 24.0364 16.3445 24.3539 15.7312 24.7068C15.2258 24.9977 14.7595 25.3503 14.481 25.7739C14.3366 25.9937 14.2286 26.2541 14.2138 26.5468C14.1986 26.8464 14.2839 27.1298 14.446 27.381ZM16.3801 25.8344C16.5146 25.757 16.6601 25.6806 16.815 25.6058C16.6564 25.8184 16.4995 26.009 16.3469 26.173C16.0035 26.5418 15.7536 26.6967 15.6191 26.7339C15.6062 26.7374 15.5967 26.7393 15.5902 26.7402C15.5799 26.7307 15.5623 26.7115 15.5391 26.6755C15.5102 26.6309 15.5129 26.6138 15.513 26.6125C15.5134 26.6052 15.5174 26.5656 15.5681 26.4885C15.68 26.3184 15.9371 26.0893 16.3801 25.8344ZM15.5781 26.7409L15.5803 26.7411C15.5788 26.7411 15.5781 26.741 15.5781 26.7409ZM15.5985 26.7471L15.6004 26.7482C15.6004 26.7483 15.5997 26.748 15.5985 26.7471ZM19.6815 23.3068L19.6052 23.3236C19.6823 23.1516 19.7571 22.978 19.8292 22.8036C19.8872 22.878 19.9457 22.9519 20.0047 23.0251C20.0546 23.0869 20.1049 23.1485 20.1557 23.2098C19.9973 23.2402 19.839 23.2726 19.6815 23.3068ZM23.5796 24.6101C23.3984 24.5058 23.2061 24.3745 23.0066 24.2206C23.2263 24.2236 23.4314 24.2357 23.6185 24.2575C24.0936 24.3128 24.3498 24.4196 24.454 24.5036C24.4748 24.5204 24.4836 24.5313 24.4868 24.5363C24.4879 24.545 24.4894 24.5779 24.4676 24.6455C24.4253 24.7768 24.3814 24.8261 24.3659 24.8405C24.3559 24.8497 24.3451 24.858 24.3109 24.8622C24.2071 24.8751 23.9702 24.835 23.5796 24.6101ZM24.4883 24.5393C24.4884 24.5393 24.4885 24.5398 24.4883 24.5393V24.5393ZM19.4801 19.2796C19.467 19.4272 19.4459 19.584 19.4173 19.7484C19.3188 19.5419 19.2365 19.345 19.1727 19.1614C19.0195 18.7201 19.0113 18.4596 19.0404 18.347C19.0437 18.334 19.0467 18.326 19.0488 18.3215C19.0602 18.3156 19.0935 18.3018 19.1643 18.2947C19.2845 18.2827 19.3329 18.3033 19.3435 18.3085C19.3502 18.3119 19.3692 18.3213 19.396 18.3704C19.4657 18.4989 19.5237 18.7845 19.4801 19.2796Z"
              fill="black"
              fillOpacity="0.6"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.4706 9.95605C13.3478 9.95605 11.627 11.6769 11.627 13.7997V28.0369C11.627 30.1597 13.3478 31.8806 15.4706 31.8806H24.5303C26.653 31.8806 28.3739 30.1597 28.3739 28.0369V16.9972C28.3739 15.9778 27.969 15.0002 27.2482 14.2794L24.0509 11.0819C23.3301 10.361 22.3524 9.95605 21.333 9.95605H15.4706ZM13.4009 13.7997C13.4009 12.6566 14.3275 11.73 15.4706 11.73H21.333C21.8819 11.73 22.4084 11.9481 22.7965 12.3363L25.9938 15.5338C26.3819 15.9219 26.5999 16.4483 26.5999 16.9972V28.0369C26.5999 29.18 25.6733 30.1066 24.5303 30.1066H15.4706C14.3275 30.1066 13.4009 29.18 13.4009 28.0369V13.7997Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>
        </SvgIcon>
      )
    }
    if (icon === 'ai_provider') {
      return <AIChipIcon sx={sxMemo} />
    }

    if (icon === 'immersive_chat') {
      return <ContextMenuIcon icon={'Fullscreen'} sx={sxMemo} />
    }
    return null
  }

  return (
    <Stack
      p={0.75}
      justifyContent="center"
      alignItems="center"
      bgcolor="background.paper"
      borderRadius={2}
    >
      {renderIcon()}
    </Stack>
  )
}
