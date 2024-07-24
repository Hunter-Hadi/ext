import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import FavoriteIcon from '@mui/icons-material/Favorite'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import Box from '@mui/material/Box'
import { ButtonProps } from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { GiftIcon } from '@/components/CustomIcon'
import { useAuthLogin } from '@/features/auth'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import {
  AffiliateTabTooltip,
  RewardsTabTooltip,
  SurveyTabTooltip,
  UpgradePlanTooltip,
} from '@/features/sidebar/components/SidebarTabs/SidebarMarketing'
import SidebarMenuItem from '@/features/sidebar/components/SidebarTabs/SidebarMenuItem'
import SidebarTabItem from '@/features/sidebar/components/SidebarTabs/SidebarTabItem'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import useFeedbackSurveyStatus from '@/features/survey/hooks/useFeedbackSurveyStatus'
import { I18nextKeysType } from '@/i18next'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export interface ISidebarTabData extends ButtonProps {
  // label标签
  label: I18nextKeysType
  // icon图标
  icon: React.ReactNode
  // conversationType点击会切换sidebar的页面
  value?: ISidebarConversationType
  // tooltip内容，如果是组件展示组件
  tooltip?: React.ReactNode | (() => I18nextKeysType)
  // 控制是否显示的函数
  isShow?: (
    info: ReturnType<typeof useUserInfo> &
      ReturnType<typeof useFeedbackSurveyStatus>,
  ) => boolean
  // tooltip显示的时候
  onOpen?: () => void
  // button点击的时候
  onClick?: () => void
  // 理论上只要一个testId就行了，之前是有2个testId，先这么配置
  buttonTestId?: string
  labelTestId?: string
}

export const SIDEBAR_MARKETING_TABS_DATA: ISidebarTabData[] = [
  {
    label: 'common:upgrade',
    icon: <ElectricBoltIcon sx={{ fontSize: 24 }} />,
    tooltip: <UpgradePlanTooltip />,
    isShow: ({ isTopPlanUser }) => !isTopPlanUser,
    buttonTestId: 'maxai--sidebar--upgrade-plan',
    labelTestId: 'max-ai__upgrade-plan',
  },
  {
    label: 'client:sidebar__marketing_tabs__rewards__tab__title',
    icon: <GiftIcon sx={{ fontSize: 24 }} />,
    tooltip: <RewardsTabTooltip />,
    href: 'https://app.maxai.me/rewards',
    isShow: ({ isFreeUser }) => isFreeUser,
    onOpen: () => {
      mixpanelTrack(`referral_card_showed`, {
        referralType: 'REWARDS',
      })
    },
    onClick: () => {
      mixpanelTrack(`referral_card_clicked`, {
        referralType: 'REWARDS',
      })
    },
    buttonTestId: 'maxai--sidebar--rewards_tab',
    labelTestId: 'max-ai__rewards-tab',
  },
  {
    label: 'client:sidebar__marketing_tabs__affiliate__tab__title',
    icon: <GiftIcon sx={{ fontSize: 24 }} />,
    tooltip: <AffiliateTabTooltip />,
    href: 'https://www.maxai.me/affiliate',
    isShow: ({ isFreeUser }) => !isFreeUser,
    onOpen: () => {
      mixpanelTrack(`referral_card_showed`, {
        referralType: 'AFFILIATE',
      })
    },
    onClick: () => {
      mixpanelTrack(`referral_card_clicked`, {
        referralType: 'AFFILIATE',
      })
    },
    buttonTestId: 'maxai--sidebar--affiliate_tab',
    labelTestId: 'max-ai__affiliate_tab',
  },
  {
    label: 'client:sidebar__marketing_tabs__survey__tab__title',
    icon: <FavoriteIcon sx={{ fontSize: 24 }} />,
    tooltip: <SurveyTabTooltip />,
    isShow: ({ canShowSurvey }) => canShowSurvey,
    onClick: () => {
      mixpanelTrack('survey_card_clicked', {
        surveyType: 'feedback',
      })
    },
    buttonTestId: 'maxai--sidebar--survey_tab',
    labelTestId: 'max-ai__rewards-tab',
  },
]

export const SIDEBAR_NAV_TABS_DATA: (ISidebarTabData & {
  value: ISidebarConversationType
})[] = [
  {
    label: 'client:sidebar__tabs__rewrite__title',
    tooltip: () => 'client:sidebar__tabs__rewrite__tooltip',
    icon: <ContextMenuIcon icon='Rewrite' sx={{ fontSize: 24 }} />,
    value: 'ContextMenu',
  },
  {
    label: 'client:sidebar__tabs__chat__title',
    tooltip: () => 'client:sidebar__tabs__chat__tooltip',
    icon: <QuestionAnswerIcon sx={{ fontSize: 24 }} />,
    value: 'Chat',
  },
  {
    label: 'client:sidebar__tabs__summary__title',
    tooltip: () => {
      const summaryType = getPageSummaryType()
      switch (summaryType) {
        case 'DEFAULT_EMAIL_SUMMARY':
          return 'client:sidebar__tabs__summary__tooltip__default_email'
        case 'PAGE_SUMMARY':
          return 'client:sidebar__tabs__summary__tooltip__page'
        case 'PDF_CRX_SUMMARY':
          return 'client:sidebar__tabs__summary__tooltip__pdf_crx'
        case 'YOUTUBE_VIDEO_SUMMARY':
          return 'client:sidebar__tabs__summary__tooltip__youtube_video'
        default:
          return 'client:sidebar__tabs__summary__tooltip__page'
      }
    },
    icon: <SummarizeOutlinedIcon sx={{ fontSize: 24 }} />,
    value: 'Summary',
  },
  {
    label: 'client:sidebar__tabs__search__title',
    tooltip: () => 'client:sidebar__tabs__search__tooltip',
    icon: <SearchOutlinedIcon sx={{ fontSize: 24 }} />,
    value: 'Search',
  },
  {
    label: 'client:sidebar__tabs__art__title',
    tooltip: () => 'client:sidebar__tabs__art__tooltip',
    icon: <ContextMenuIcon icon='Art' sx={{ fontSize: 24 }} />,
    value: 'Art',
  },
]

const SidebarTabs: FC = () => {
  const { t } = useTranslation()

  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()
  const { isLogin, loaded } = useAuthLogin()
  const userInfo = useUserInfo()
  const surveyStatus = useFeedbackSurveyStatus()
  const containerRef = useRef<HTMLDivElement>()
  const marketingContainerRef = useRef<HTMLDivElement>()
  const navContainerRef = useRef<HTMLDivElement>()
  const [isMoreMarketing, setIsMoreMarketing] = useState(false)
  const [isMoreNav, setIsMoreNav] = useState(false)

  // 在 immersive chat 页面, 有特殊的渲染逻辑
  const isInImmersiveChatPage = useMemo(() => isMaxAIImmersiveChatPage(), [])

  useEffect(() => {
    const listener = (event: any) => {
      const type: ISidebarConversationType = event?.detail?.type
      if (type) {
        updateSidebarConversationType(type)
      }
    }
    const resizeListener = debounce(() => {
      if (
        !containerRef.current ||
        !marketingContainerRef.current ||
        !navContainerRef.current
      ) {
        return
      }
      const containerHeight = containerRef.current?.clientHeight
      const marketingHeight = marketingContainerRef.current?.clientHeight
      const navHeight = navContainerRef.current?.clientHeight
      setIsMoreMarketing(containerHeight < marketingHeight + navHeight)
      setIsMoreNav(containerHeight < navHeight)
    }, 100)
    resizeListener()
    window.addEventListener('MaxAISwitchSidebarTab', listener)
    window.addEventListener('resize', resizeListener)
    return () => {
      resizeListener.cancel()
      window.removeEventListener('MaxAISwitchSidebarTab', listener)
      window.removeEventListener('resize', resizeListener)
    }
  })

  const sidebarMarketingTabs = useMemo(() => {
    return SIDEBAR_MARKETING_TABS_DATA.filter((tab) => {
      if (tab.isShow && !tab.isShow({ ...userInfo, ...surveyStatus })) {
        return false
      }
      return true
    })
  }, [])

  const sidebarNavTabs = useMemo(() => {
    return SIDEBAR_NAV_TABS_DATA.filter((tab) => {
      if (tab.isShow && !tab.isShow({ ...userInfo, ...surveyStatus })) {
        return false
      }
      if (tab.value === 'Summary' && isInImmersiveChatPage) {
        return false
      }
      return true
    })
  }, [])

  const moreButton =
    isMoreMarketing || isMoreNav ? (
      <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
        <SidebarTabItem
          label={t('common:more')}
          icon={<ContextMenuIcon icon='More' sx={{ fontSize: 24 }} />}
          tooltip={
            <Paper
              sx={{
                borderRadius: 2,
                p: 1,
                maxHeight: 220,
                minWidth: 160,
                overflow: 'auto',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'customColor.secondaryBackground'
                    : '#fff',
              }}
            >
              <Stack spacing={0.5}>
                {isMoreNav &&
                  sidebarNavTabs.map((item) => {
                    const isActive =
                      currentSidebarConversationType === item.value

                    return (
                      <SidebarMenuItem
                        key={item.value}
                        label={t(item.label)}
                        icon={item.icon}
                        tooltip={
                          typeof item.tooltip === 'function'
                            ? t(item.tooltip())
                            : item.tooltip
                        }
                        placement={isInImmersiveChatPage ? 'right' : 'left'}
                        active={isActive}
                        onClick={() => {
                          updateSidebarConversationType(item.value)
                        }}
                        buttonTestId={`maxai--sidebar--${item.value.toLowerCase()}_tab`}
                        labelTestId={`max-ai__${item.value.toLowerCase()}-tab`}
                      />
                    )
                  })}

                {isMoreMarketing && isMoreNav && (
                  <Divider sx={{ mx: '8px!important' }} />
                )}

                {isMoreMarketing &&
                  sidebarMarketingTabs.map((item, index) => (
                    <SidebarMenuItem
                      key={index}
                      label={t(item.label)}
                      icon={item.icon}
                      tooltip={
                        typeof item.tooltip === 'function'
                          ? t(item.tooltip())
                          : item.tooltip
                      }
                      target={item.href ? '_blank' : undefined}
                      href={item.href}
                      placement={isInImmersiveChatPage ? 'right' : 'left'}
                      onClick={item.onClick}
                      buttonTestId={item.buttonTestId}
                      labelTestId={item.labelTestId}
                    />
                  ))}
              </Stack>
            </Paper>
          }
        />
      </Box>
    ) : null

  return (
    <Stack
      ref={containerRef as any}
      justifyContent={'space-between'}
      sx={{
        width: '100%',
        height: 0,
        flex: 1,
        // flexDirection: isInImmersiveChatPage ? 'column-reverse' : 'column',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Stack
        ref={marketingContainerRef as any}
        data-testid={'maxAISidebarMarketingTabsContainer'}
        alignItems={'center'}
        width={'100%'}
        visibility={isMoreMarketing ? 'hidden' : 'visible'}
        spacing={2}
        sx={{
          position: 'absolute',
          ...(isInImmersiveChatPage
            ? {
                bottom: 0,
              }
            : { top: 0 }),
        }}
      >
        {isLogin &&
          loaded &&
          sidebarMarketingTabs.map((item, index) => {
            return (
              <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5} key={index}>
                <SidebarTabItem
                  label={t(item.label)}
                  icon={item.icon}
                  tooltip={
                    typeof item.tooltip === 'function'
                      ? t(item.tooltip())
                      : item.tooltip
                  }
                  target={item.href ? '_blank' : undefined}
                  href={item.href}
                  placement={isInImmersiveChatPage ? 'right' : 'left'}
                  onClick={item.onClick}
                  buttonTestId={item.buttonTestId}
                  labelTestId={item.labelTestId}
                />
              </Box>
            )
          })}
      </Stack>

      <Stack
        ref={navContainerRef as any}
        data-testid={'maxAISidebarTabsContainer'}
        alignItems={'center'}
        width={'100%'}
        spacing={2}
        sx={{
          position: 'absolute',
          zIndex: 1,
          ...(isInImmersiveChatPage
            ? {
                top: 0,
              }
            : { bottom: 0 }),
        }}
      >
        {isInImmersiveChatPage && isMoreNav ? moreButton : null}

        <Stack
          alignItems={'center'}
          width={'100%'}
          spacing={2}
          visibility={isMoreNav ? 'hidden' : 'visible'}
        >
          {sidebarNavTabs.map((item) => {
            const isActive = currentSidebarConversationType === item.value

            return (
              <Box
                width={1}
                px={isInImmersiveChatPage ? 1 : 0.5}
                key={item.value}
              >
                <SidebarTabItem
                  label={t(item.label)}
                  icon={item.icon}
                  tooltip={
                    typeof item.tooltip === 'function'
                      ? t(item.tooltip())
                      : item.tooltip
                  }
                  placement={isInImmersiveChatPage ? 'right' : 'left'}
                  active={isActive}
                  onClick={() => {
                    updateSidebarConversationType(item.value)
                  }}
                  buttonTestId={`maxai--sidebar--${item.value.toLowerCase()}_tab`}
                  labelTestId={`max-ai__${item.value.toLowerCase()}-tab`}
                />
              </Box>
            )
          })}
        </Stack>

        {!isInImmersiveChatPage || !isMoreNav ? moreButton : null}
      </Stack>
    </Stack>
  )
}
export default SidebarTabs
