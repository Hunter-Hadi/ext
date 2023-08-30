import { RangyContextMenu } from '@/features/contextMenu'
import { useSetRecoilState } from 'recoil'
import React, { FC, useEffect, useMemo } from 'react'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuRootElement,
  showChatBox,
} from '@/utils'
import { AppSettingsState } from '@/store'
import { useInitChatGPTClient } from '@/features/chatgpt'
import Button from '@mui/material/Button'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import { setChromeExtensionSettings } from '@/background/utils'
import Log from '@/utils/Log'
import { useAuthLogin } from '@/features/auth'
import useInitRangy from '@/features/contextMenu/hooks/useInitRangy'
import CloseAlert from '@/components/CloseAlert'
import Stack from '@mui/material/Stack'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { render } from 'react-dom'
import Link from '@mui/material/Link'
import useEffectOnce from '@/hooks/useEffectOnce'
import useInjectShortCutsRunTime from '@/features/shortcuts/hooks/useInjectShortCutsRunTime'
import useInterval from '@/hooks/useInterval'
import Divider from '@mui/material/Divider'
import { RESOURCES_URL } from '@/constants'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitI18n } from '@/i18n/hooks'
import { useTranslation } from 'react-i18next'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import useInitClientConversationMap from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { isMaxAINewTabPage } from '@/pages/chat/util'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import { getEnv } from '@/utils/AppEnv'
import Browser from 'webextension-polyfill'
import { clientGetBrowserInfo } from '@/utils/larkBot'

const log = new Log('AppInit')

const UseChatGPTWebPageJumpToShortCuts = () => {
  if (
    window.location.host !== 'www.usechatgpt.ai' &&
    window.location.host !== 'www.maxai.me'
  ) {
    return <></>
  }
  return (
    <Button
      onClick={() => {
        chromeExtensionClientOpenPage({
          key: 'shortcuts',
        })
      }}
      id={'usechatgpt-www-to-shortcuts'}
      sx={{ position: 'absolute', width: 1, height: 1, zIndex: -1, opacity: 0 }}
    />
  )
}

const RangyInit = () => {
  useInitRangy()
  return <></>
}

export const AppSettingsInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const settings = await clientGetLiteChromeExtensionSettings()
      if (settings) {
        setAppSettings({
          ...settings,
        })
        log.info('get settings', settings)
        if (settings.userSettings && !settings.userSettings?.colorSchema) {
          const defaultColorSchema = window.matchMedia(
            '(prefers-color-scheme: dark)',
          ).matches
            ? 'dark'
            : 'light'
          await setChromeExtensionSettings({
            userSettings: {
              ...settings.userSettings,
              colorSchema: defaultColorSchema,
            },
          })
          setAppSettings({
            ...settings,
            userSettings: {
              ...settings.userSettings,
              colorSchema: defaultColorSchema,
            },
          })
        }
      }
    }
    updateAppSettings()
    window.addEventListener('focus', updateAppSettings)
    return () => {
      window.removeEventListener('focus', updateAppSettings)
    }
  }, [])
  return <></>
}

const useHandlePDFViewerError = () => {
  const { t } = useTranslation(['common', 'client'])
  const [delay, setDelay] = React.useState<number | null>(null)
  const initRef = React.useRef(false)
  useEffectOnce(() => {
    if (window.location.href.includes(Browser.runtime.id)) {
      if (window.location.href.includes('/pages/pdf/web/viewer.html')) {
        setDelay(100)
      }
    }
  })
  useInterval(() => {
    const root = document.body.querySelector('#usechatgptPDFViewerErrorAlert')
    if (root) {
      if (initRef.current) {
        return
      }
      console.log('PDFViewerError', delay, initRef.current)
      initRef.current = true
      setDelay(null)
      const dataUrl = root.getAttribute('data-url')
      render(
        <Stack
          spacing={2}
          p={2}
          width={'100%'}
          sx={{
            boxSizing: 'border-box',
          }}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            justifyContent="center"
            spacing={1.4}
            color="#fff"
          >
            <img
              style={{ flexShrink: 0, alignSelf: 'center' }}
              height={48}
              width={48}
              src={'/assets/USE_CHAT_GPT_AI/icons/maxai_48_normal.png'}
            />
            {/* <UseChatGptIcon sx={{ fontSize: 48 }} /> */}
            <Typography variant={'body1'} fontSize={18} fontWeight={700}>
              {t('client:pdf__info_card__title')}
            </Typography>
          </Stack>
          <Stack alignItems={'center'} spacing={0}>
            <Typography
              flex={1}
              color={'rgba(255,255,255,0.85)'}
              fontSize={'14px'}
              sx={{
                overflowWrap: 'break-word',
              }}
            >
              {t('client:pdf__info_card__access_permission__description1')}
              <Link
                color={'rgba(255,255,255,1)'}
                href={'#'}
                onClick={async (event) => {
                  event.preventDefault()
                  await chromeExtensionClientOpenPage({
                    key: 'manage_extension',
                  })
                  window.close()
                }}
              >
                {`chrome://extensions`}
              </Link>
              {` ${t(
                'client:pdf__info_card__access_permission__description2',
              )} `}
            </Typography>
            <Typography
              flex={1}
              color={'rgba(255,255,255,0.85)'}
              fontSize={'14px'}
              sx={{
                // overflowWrap: 'break-word',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 2,
              }}
            >
              {dataUrl}
            </Typography>
            <Box mb={2}>
              <img
                style={{ flexShrink: 0, alignSelf: 'center' }}
                height={156}
                width={468}
                src={`${RESOURCES_URL}/extension/pdf/guide1.gif`}
              />
            </Box>
            <Button
              disableElevation
              size={'small'}
              variant={'contained'}
              onClick={async (event) => {
                event.preventDefault()
                await chromeExtensionClientOpenPage({
                  key: 'manage_extension',
                })
                window.close()
              }}
              sx={{
                height: '56px',
                backgroundColor: '#7601D3',
                color: '#fff',
                fontSize: '18px',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  backgroundColor: '#7601D3',
                  color: '#fff',
                },
              }}
            >
              {t('client:pdf__info_card__access_permission__button')}
            </Button>
          </Stack>
          <Divider
            sx={{
              color: '#fff',
            }}
          >
            {t('common:or')}
          </Divider>
          <Stack spacing={2}>
            <Typography
              flex={1}
              color={'rgba(255,255,255,0.85)'}
              fontSize={'14px'}
              sx={{
                overflowWrap: 'break-word',
              }}
            >
              {t('client:pdf__info_card__disabled__description1')}
              <Link
                color={'rgba(255,255,255,1)'}
                href={'#'}
                onClick={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  await chromeExtensionClientOpenPage({
                    key: 'options',
                    query: '?id=pdf-viewer#/appearance',
                  })
                  window.close()
                }}
              >
                {t('client:pdf__info_card__disabled__description2')}
              </Link>
              {t('client:pdf__info_card__disabled__description3')}
            </Typography>
            <img
              style={{ flexShrink: 0, alignSelf: 'center' }}
              height={156}
              width={468}
              src={`${RESOURCES_URL}/extension/pdf/guide2.gif`}
            />
          </Stack>
        </Stack>,
        root,
      )
      return
    }
  }, delay)
}
/**
 * 关闭PDF预览功能，实际上是跳转到settings里
 * @constructor
 */
export const DisabledPDFViewer: FC = () => {
  const { t } = useTranslation(['client', 'common'])
  const RenderDom = useMemo(() => {
    if (window.location.href.includes(Browser.runtime.id)) {
      if (window.location.href.includes('/pages/pdf/web/viewer.html')) {
        if (document.body.querySelector('#usechatgpt-disabled-pdf')) {
          return null
        }
        if (
          window.localStorage.getItem('hide_usechatgptai_pdf_alert') === 'true'
        ) {
          return null
        }
        return (
          <Box
            position={'fixed'}
            right={8}
            top={40}
            zIndex={10000}
            id={'usechatgpt-disabled-pdf'}
          >
            <CloseAlert
              icon={<></>}
              action={<></>}
              sx={{
                p: '8px!important',
                bgcolor: '#fff',
                border: '1px solid #7601D3',
                '& > div': {
                  '&:first-of-type': {
                    display: 'none',
                  },
                  '&:nth-of-type(2)': {
                    padding: '0!important',
                  },
                  '&:last-of-type': {
                    margin: '0!important',
                    padding: '0!important',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                  },
                },
                '& *': {
                  color: '#7601D3',
                },
              }}
            >
              <Stack spacing={1} maxWidth={320}>
                <Stack direction={'row'} alignItems={'center'} spacing={1}>
                  <UseChatGptIcon sx={{ fontSize: 14 }} />
                  <Typography variant={'body1'} fontSize={14} fontWeight={700}>
                    {t('client:pdf__floating_card__title')}
                  </Typography>
                </Stack>
                <Typography fontSize={14}>
                  {t('client:pdf__floating_card__description1')}
                  <Link
                    href={'#'}
                    onClick={async (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      await chromeExtensionClientOpenPage({
                        key: 'options',
                        query: '?id=pdf-viewer#/appearance',
                      })
                    }}
                  >
                    {t('client:pdf__floating_card__description2')}
                  </Link>
                  {t('client:pdf__floating_card__description3')}
                </Typography>
                <Button
                  size={'small'}
                  disableElevation
                  sx={{
                    bgcolor: '#7601D3',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#7601D3',
                    },
                    textTransform: 'none',
                  }}
                  onClick={async () => {
                    window.localStorage.setItem(
                      'hide_usechatgptai_pdf_alert',
                      JSON.stringify(true),
                    )
                    getAppContextMenuRootElement()
                      ?.querySelector('#usechatgpt-disabled-pdf')
                      ?.remove()
                  }}
                >
                  {t('client:pdf__floating_card__button')}
                </Button>
              </Stack>
            </CloseAlert>
          </Box>
        )
      }
    }
    return null
  }, [t])
  return RenderDom
}

const GmailInit = React.lazy(() => import('@/components/AppInit/GmailInit'))
const AppInit = () => {
  useInitChatGPTClient()
  useInitClientConversationMap()
  useAuthLogin()
  userInitUserInfo()
  useInitI18n()
  useInjectShortCutsRunTime()
  useHandlePDFViewerError()
  useInitSidebar()
  useEffectOnce(() => {
    if (isMaxAINewTabPage()) {
      showChatBox()
    }
    clientGetBrowserInfo().then().catch()
  })
  return (
    <>
      <AppSuspenseLoadingLayout>
        {getEnv() === 'gmail' && <GmailInit />}
      </AppSuspenseLoadingLayout>
      <RangyInit />
      <RangyContextMenu />
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
