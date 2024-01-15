import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import { render } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import DynamicComponent from '@/components/DynamicComponent'
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
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { useInitI18n } from '@/i18n/hooks'
import useHideInHost from '@/minimum/hooks/useHideInHost'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import { chromeExtensionClientOpenPage } from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import {
  isMaxAIImmersiveChatPage,
  isMaxAIPDFPage,
} from '@/utils/dataHelper/websiteHelper'
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
          maxWidth={'1088px'}
          width={'100vw'}
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

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: 12,
    padding: '16px',
    boxShadow: theme.shadows[5],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

const PDFAIViewerTopBarButtonGroup: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const [show, setShow] = useState(false)
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [isAccessPermission, setIsAccessPermission] = useState(true)
  useEffectOnce(() => {
    if (isMaxAIPDFPage()) {
      Browser.extension.isAllowedFileSchemeAccess().then(setIsAccessPermission)
      const pdfViewerRoot = document.querySelector('#toolbarViewerLeft')
      if (pdfViewerRoot) {
        const div = document.createElement('div')
        div.id = 'MaxAIPDFViewerTopBarButtonGroup'
        div.style.display = 'flex'
        div.style.alignItems = 'center'
        div.style.height = '32px'
        pdfViewerRoot.appendChild(div)
        setRootElement(div)
      }
      setShow(true)
    }
  })
  if (!show || !rootElement) {
    return null
  }
  return (
    <DynamicComponent
      rootContainer={rootElement}
      customElementName={'maxai-pdf-viewer-top-bar-button-group'}
    >
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <LightTooltip
          PopperProps={{
            container: rootElement,
            disablePortal: true,
          }}
          title={
            <Stack width={320} gap={1}>
              <Typography fontSize={'16px'} fontWeight={700}>
                {t(
                  'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__title',
                )}
              </Typography>
              <Typography fontSize={'14px'} fontWeight={400}>
                {t(
                  'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__description1',
                )}{' '}
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
                  }}
                >
                  {t('client:pdf__info_card__disabled__description2')}
                </Link>
                {t('client:pdf__info_card__disabled__description3')}
              </Typography>
              <img
                style={{ flexShrink: 0, alignSelf: 'center' }}
                width={'100%'}
                src={getChromeExtensionAssetsURL('/images/pdf/guide-2.gif')}
              />
            </Stack>
          }
          placement={'bottom-start'}
          arrow
        >
          <Button
            onClick={async () => {
              await chromeExtensionClientOpenPage({
                key: 'options',
                query: '?id=pdf-viewer#/appearance',
              })
            }}
            sx={{
              fontSize: '14px',
              color: 'text.primary',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {t('client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__title')}
            <Switch checked size={'small'} />
          </Button>
        </LightTooltip>
        {!isAccessPermission && (
          <LightTooltip
            PopperProps={{
              container: rootElement,
              disablePortal: true,
            }}
            title={
              <Stack width={320} gap={1}>
                <Typography fontSize={'16px'} fontWeight={700}>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__title',
                  )}
                </Typography>
                <Typography fontSize={'14px'} fontWeight={400}>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__description1',
                  )}{' '}
                  <Link
                    color={'rgba(255,255,255,1)'}
                    href={'#'}
                    onClick={async (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      await chromeExtensionClientOpenPage({
                        key: 'manage_extension',
                      })
                    }}
                  >
                    {'chrome://extensions'}
                  </Link>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__description2',
                  )}
                </Typography>
                <img
                  style={{ flexShrink: 0, alignSelf: 'center' }}
                  width={'100%'}
                  src={getChromeExtensionAssetsURL('/images/pdf/guide-2.gif')}
                />
              </Stack>
            }
            placement={'bottom-start'}
            arrow
          >
            <Button
              onClick={async () => {
                await chromeExtensionClientOpenPage({
                  key: 'manage_extension',
                })
              }}
              sx={{
                fontSize: '14px',
                color: 'text.primary',
                height: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {'Drag & drop PDF'}
              <Switch checked={isAccessPermission} size={'small'} />
            </Button>
          </LightTooltip>
        )}
      </Stack>
    </DynamicComponent>
  )
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
    // 判断是不是chrome自带的pdf viewer
    if (
      document.querySelector('embed[name][type="application/pdf"][internalid]')
    ) {
      chromeExtensionClientOpenPage({
        key: 'pdf_viewer',
      })
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
      <PDFAIViewerTopBarButtonGroup />
      <ContextMenuRoot />
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
