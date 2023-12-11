import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { render } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import CloseAlert from '@/components/CloseAlert'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { useAuthLogin } from '@/features/auth'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitChatGPTClient } from '@/features/chatgpt'
import useInitClientConversationMap from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useInterval from '@/features/common/hooks/useInterval'
import ContextMenuRoot from '@/features/contextMenu/components/ContextMenuRoot'
import useInitRangy from '@/features/contextMenu/hooks/useInitRangy'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import useInitOneClickShareButton from '@/features/referral/hooks/useInitOneClickShareButton'
import useInjectShortCutsRunTime from '@/features/shortcuts/hooks/useInjectShortCutsRunTime'
import { ShortcutMessageClientInit } from '@/features/shortcuts/messageChannel/client'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import { useInitI18n } from '@/i18n/hooks'
import useHideInHost from '@/minimum/hooks/useHideInHost'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import {
  chromeExtensionClientOpenPage,
  getAppContextMenuRootElement,
  showChatBox,
} from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { renderGlobalSnackbar } from '@/utils/globalSnackbar'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import { clientGetBrowserInfo } from '@/utils/larkBot'
import Log from '@/utils/Log'

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

export const AppSettingsInit = () => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const liteChromeExtensionDBStorage = await clientGetLiteChromeExtensionDBStorage()
      if (liteChromeExtensionDBStorage) {
        setAppDBStorage({
          ...liteChromeExtensionDBStorage,
        })
        log.info('get db settings', liteChromeExtensionDBStorage)
      }
      const chromeExtensionLocalStorage = await getChromeExtensionLocalStorage()
      if (chromeExtensionLocalStorage) {
        setAppLocalStorage({
          ...chromeExtensionLocalStorage,
        })
        log.info('get local settings', chromeExtensionLocalStorage)
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
                src={getChromeExtensionAssetsURL('/images/pdf/guide-1.gif')}
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
              src={getChromeExtensionAssetsURL('/images/pdf/guide-2.gif')}
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

const AppInit = () => {
  useHideInHost()
  useInitChatGPTClient()
  useAuthLogin()
  userInitUserInfo()
  useInitI18n()
  useInjectShortCutsRunTime()
  useInitWebPageMessageChannel()
  useInitClientConversationMap()
  useHandlePDFViewerError()
  useInitSidebar()
  useEffectOnce(() => {
    if (isMaxAIImmersiveChatPage()) {
      showChatBox()
    }
    renderGlobalSnackbar()
    ShortcutMessageClientInit()
    clientGetBrowserInfo().then().catch()
    initClientProxyWebsocket()
  })
  // 初始化one-click referral, https://app.maxai.me/referral
  useInitOneClickShareButton()
  useInitRangy()
  return (
    <>
      <ContextMenuRoot />
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
