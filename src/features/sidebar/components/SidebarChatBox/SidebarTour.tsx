import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  CleanChatBoxIcon,
  MagicBookIcon,
  UseChatGptIcon,
} from '@/components/CustomIcon'
import LanguageCodeSelect from '@/components/select/LanguageCodeSelect'
import { useAuthLogin } from '@/features/auth'
import Tour from '@/features/common/components/Tour'
import { TourStepInfo } from '@/features/common/components/Tour/TourStep'
import { useFocus } from '@/features/common/hooks/useFocus'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { sidebarTabsData } from '@/features/sidebar/components/SidebarTabs'
import SidebarTabIcons from '@/features/sidebar/components/SidebarTabs/SidebarTabIcons'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { updateContextMenuSearchTextStore } from '@/pages/settings/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const Step1Content: FC = () => {
  const { t } = useTranslation(['settings'])
  const { userSettings, setUserSettings } = useUserSettings()
  return (
    <Stack width={'424px'} mt={1}>
      <LanguageCodeSelect
        sx={{ flexShrink: 0, width: 220 }}
        label={t(
          'settings:feature_card__preferred_language__field_preferred_language_label',
        )}
        defaultValue={userSettings?.preferredLanguage}
        onChange={async (newLanguage) => {
          await setUserSettings({
            ...userSettings,
            preferredLanguage: newLanguage,
          })
          await updateContextMenuSearchTextStore('textSelectPopupButton')
        }}
      />
    </Stack>
  )
}
const Step2Content: FC = () => {
  const { t } = useTranslation(['maxai_tour', 'client'])
  return (
    <Stack width={'296px'} mt={1} gap={1}>
      {sidebarTabsData.map((sidebarTab, index) => {
        let label = ''
        if (sidebarTab.value === 'Chat') {
          label = t('maxai_tour:sidebar_tour__step__2__description_1')
        } else if (sidebarTab.value === 'Summary') {
          label = t('maxai_tour:sidebar_tour__step__2__description_2')
        } else if (sidebarTab.value === 'Search') {
          label = t('maxai_tour:sidebar_tour__step__2__description_3')
        } else if (sidebarTab.value === 'Art') {
          label = t('maxai_tour:sidebar_tour__step__2__description_4')
        }
        return (
          <Stack
            key={sidebarTab.value}
            direction={'row'}
            alignItems="center"
            gap={1}
            sx={{
              width: '100%',
              color: 'text.secondary',
              cursor: 'auto',
              position: 'relative',
              borderRadius: 2,
            }}
          >
            <Stack
              sx={{
                bgcolor: 'rgb(235,235,235)',
                color: 'rgba(0,0,0,.6)',
              }}
              width={48}
              height={48}
              alignItems={'center'}
              justifyContent={'center'}
              borderRadius={'8px'}
            >
              <SidebarTabIcons icon={sidebarTab.icon} />
            </Stack>
            <Typography fontSize={14} color={'text.primary'}>
              {label}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}

const Step3Content: FC = () => {
  const { t } = useTranslation(['maxai_tour', 'client'])
  return (
    <Stack width={'296px'} mt={1} gap={1}>
      <Typography
        textAlign={'left'}
        fontSize={'14px'}
        color={'text.primary'}
        sx={{
          whiteSpace: 'pre-wrap',
          display: 'inline',
        }}
      >
        {t('maxai_tour:sidebar_tour__step__3__description_1') + '\n'}
        <Typography component={'span'} color={'primary.main'}>
          {'ChatGPT, Claude, Gemini '}
        </Typography>
        {t('maxai_tour:sidebar_tour__step__3__description_2')}
      </Typography>
    </Stack>
  )
}
const Step4Content: FC = () => {
  const { t } = useTranslation(['maxai_tour', 'client'])
  return (
    <Stack width={'296px'} mt={1} gap={1}>
      <Typography
        textAlign={'left'}
        fontSize={'14px'}
        color={'text.primary'}
        sx={{
          whiteSpace: 'pre-wrap',
          display: 'inline',
        }}
      >
        {t('maxai_tour:sidebar_tour__step__4__description')}
      </Typography>
    </Stack>
  )
}
const Step5Content: FC = () => {
  const { t } = useTranslation(['maxai_tour', 'client'])
  const featureList = useMemo(() => {
    return [
      {
        icon: (
          <CleanChatBoxIcon
            sx={{ color: '#fff', fontSize: '20px', borderRadius: '8px' }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_1__title'),
      },
      {
        icon: (
          <ContextMenuIcon
            icon={'Settings'}
            sx={{
              fontSize: '20px',
              borderRadius: '8px',
            }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_2__title'),
      },
      {
        icon: (
          <ContextMenuIcon
            icon={'History'}
            sx={{
              fontSize: '20px',
              borderRadius: '8px',
            }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_3__title'),
      },
      {
        icon: (
          <ContentCutOutlinedIcon
            sx={{
              transform: 'rotate(-90deg)',
              fontSize: '20px',
              borderRadius: '8px',
            }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_4__title'),
      },
      {
        icon: (
          <MagicBookIcon
            sx={{
              fontSize: '20px',
              borderRadius: '8px',
            }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_5__title'),
      },
      {
        icon: (
          <UseChatGptIcon
            sx={{
              fontSize: '20px',
              color: 'text.secondary',
              borderRadius: '8px',
            }}
          />
        ),
        title: t('maxai_tour:sidebar_tour__step__5__feature_6__title'),
      },
    ]
  }, [t])
  return (
    <Stack width={'424px'} mt={1} gap={1}>
      <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
        {featureList.map((feature, index) => {
          const boxSx: SxProps =
            index === 0
              ? {
                  bgcolor: 'primary.main',
                }
              : {
                  border: '1px solid',
                  borderColor: 'customColor.borderColor',
                }
          return (
            <Stack
              direction={'row'}
              key={feature.title}
              sx={{
                width: 'calc(50% - 8px)',
              }}
              gap={1}
              alignItems={'center'}
            >
              <Stack
                alignItems={'center'}
                justifyContent={'center'}
                width={32}
                height={32}
                sx={{
                  borderRadius: '8px',
                  ...boxSx,
                }}
              >
                {feature.icon}
              </Stack>
              <Typography
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
              >
                {feature.title}
              </Typography>
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}

const SidebarTour: FC = () => {
  const { t } = useTranslation(['maxai_tour'])
  const { isLogin, loaded } = useAuthLogin()
  const isImmersiveChatRef = useRef(isMaxAIImmersiveChatPage())
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [appContainer, setAppContainer] = useState<HTMLElement | null>(null)
  const [chatBoxContainer, setChatBoxContainer] = useState<HTMLElement | null>(
    null,
  )
  useEffect(() => {
    const root = getMaxAISidebarRootElement() as HTMLElement
    const container = root?.querySelector(
      `#MaxAISidebarContainer`,
    ) as HTMLElement
    getChromeExtensionOnBoardingData().then((onBoardingData) => {
      if (onBoardingData.ON_BOARDING_MAXAI_3_0) {
        // 已经引导过了
      } else {
        if (container) {
          setAppContainer(root)
          setContainer(isImmersiveChatRef.current ? document.body : container)
          setChatBoxContainer(container)
        }
      }
    })
  }, [])
  useFocus(() => {
    getChromeExtensionOnBoardingData().then((onBoardingData) => {
      if (onBoardingData.ON_BOARDING_MAXAI_3_0) {
        setContainer(null)
      }
    })
  })
  const memoSteps = useMemo(() => {
    const steps: TourStepInfo[] = [
      {
        target: () => {
          const sidebarBox = chatBoxContainer || appContainer
          if (sidebarBox) {
            const rect = sidebarBox.getBoundingClientRect()
            // 伪造一个垂直居中的元素
            return {
              getBoundingClientRect() {
                return {
                  width: 0,
                  left: rect.left + rect.width / 2,
                  top: rect.height / 2,
                  height: 0,
                }
              },
            }
          }
          return null
        },
        gap: {
          offset: 0,
        },
        placement: 'bottom',
        title: t('maxai_tour:sidebar_tour__step__1__title'),
        description: <Step1Content />,
        closeIcon: null,
      },
      {
        target: () => {
          return appContainer?.querySelector(
            `[data-testid="maxAISidebarTabsContainer"]`,
          ) as HTMLDivElement
        },
        arrow: true,
        placement: 'left',
        title: t('maxai_tour:sidebar_tour__step__2__title'),
        description: <Step2Content />,
        closeIcon: null,
      },
      {
        target: () => {
          return appContainer?.querySelector(
            `#max-ai__ai-provider-floating-button`,
          ) as HTMLDivElement
        },
        arrow: true,
        placement: 'top-start',
        title: t('maxai_tour:sidebar_tour__step__3__title'),
        description: <Step3Content />,
        imgCover: getChromeExtensionAssetsURL(
          '/images/on-boarding/immersive-chat.gif',
        ),
        sx: {
          maxWidth: '320px',
        },
        closeIcon: null,
      },
      {
        target: () => {
          return appContainer?.querySelector(
            `[data-testid="maxai--sidebar--immersive_chat--button"]`,
          ) as HTMLDivElement
        },
        arrow: true,
        placement: 'left-end',
        title: t('maxai_tour:sidebar_tour__step__4__title'),
        description: <Step4Content />,
        imgCover: getChromeExtensionAssetsURL(
          '/images/on-boarding/immersive-chat.gif',
        ),
        sx: {
          maxWidth: '320px',
        },
        closeIcon: null,
      },
      {
        target: () => {
          const sidebarBox = chatBoxContainer || appContainer
          if (sidebarBox) {
            const rect = sidebarBox.getBoundingClientRect()
            // 伪造一个垂直居中的元素
            return {
              getBoundingClientRect() {
                return isImmersiveChatRef.current
                  ? {
                      width: rect.width,
                      left: rect.left + 8,
                      top: rect.height + rect.top - 170 - 12,
                      height: 170,
                    }
                  : {
                      width: rect.width - 28,
                      left: rect.left + 12,
                      top: rect.height + rect.top - 185 - 6,
                      height: 185 - 8,
                    }
              },
            }
          }
          return null
        },
        arrow: true,
        placement: 'top',
        title: t('maxai_tour:sidebar_tour__step__5__title'),
        description: <Step5Content />,
        closeIcon: null,
      },
    ]
    if (isImmersiveChatRef.current) {
      // 删除step4 - immersive chat
      steps.splice(3, 1)
    }
    return steps
  }, [t, appContainer])
  if (!container || !loaded || !isLogin) return null
  return (
    <Tour
      zIndex={2147483647}
      rootContainer={container}
      open={true}
      maskMode={isImmersiveChatRef.current ? 'fixed' : 'absolute'}
      steps={memoSteps}
      onFinish={async () => {
        await setChromeExtensionOnBoardingData('ON_BOARDING_MAXAI_3_0', true)
      }}
    />
  )
}
export default SidebarTour
