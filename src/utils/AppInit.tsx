import { ChatGPTConversationState } from '@/features/gmail/store'
import { RangyContextMenu } from '@/features/contextMenu'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import React, { useEffect } from 'react'
import { chromeExtensionClientOpenPage } from '@/utils/index'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import { AppSettingsState, AppState } from '@/store'
import { useInitChatGPTClient } from '@/features/chatgpt'
import Button from '@mui/material/Button'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import {
  getChromeExtensionContextMenu,
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import Log from '@/utils/Log'
import { useAuthLogin } from '@/features/auth'
import { isEzMailApp } from '@/types'
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
import { Divider } from '@mui/material'

const log = new Log('AppInit')

const GmailInit = () => {
  if (isEzMailApp) {
    import(String(process.env.INBOX_SDK_PATH)).then((module) => {
      module.default()
    })
  }
  return (
    <>
      <style>{'.aSt {max-width: calc(100% - 700px)}'}</style>
    </>
  )
}
const UseChatGPTWebPageJumpToShortCuts = () => {
  if (window.location.host !== 'www.usechatgpt.ai') {
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

const ForceUpdateContextMenuReadOnlyOption = () => {
  useEffect(() => {
    const menuType = isEzMailApp ? 'gmailToolBarContextMenu' : 'contextMenus'
    const defaultJsonData = isEzMailApp
      ? defaultGmailToolbarContextMenuJson
      : defaultContextMenuJson
    getChromeExtensionContextMenu(menuType).then(async (menuList) => {
      const defaultJsonMap = new Map()
      defaultJsonData.forEach((item) => {
        defaultJsonMap.set(item.id, item)
      })
      let updateCount = 0
      const updateMenuList = menuList.map((item) => {
        if (!item.data.editable) {
          // force update
          const defaultItem = defaultJsonMap.get(item.id)
          if (defaultItem) {
            updateCount++
            return {
              ...defaultItem,
              id: item.id,
              parent: item.parent,
            }
          }
        }
        return item
      })
      console.log('force update menu count', updateCount, menuList)
      await setChromeExtensionSettings({
        [menuType]: updateMenuList,
      })
    })
  }, [])
  return <></>
}

export const AppSettingsInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const settings = await getChromeExtensionSettings()
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
        if (settings?.currentModel) {
          updateConversation((conversation) => {
            return {
              ...conversation,
              model: settings.currentModel || '',
            }
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
  const [delay, setDelay] = React.useState<number | null>(null)
  const initRef = React.useRef(false)
  useEffectOnce(() => {
    if (window.location.href.startsWith('chrome-extension://')) {
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
          spacing={3}
          p={2}
          width={'100%'}
          sx={{
            boxSizing: 'border-box',
          }}
        >
          <img
            style={{ flexShrink: 0, alignSelf: 'center' }}
            height={48}
            width={48}
            src={'/assets/USE_CHAT_GPT_AI/icons/usechatGPT_48_normal_dark.png'}
          />
          <Stack alignItems={'center'} spacing={0}>
            <Typography
              flex={1}
              color={'rgba(255,255,255,0.85)'}
              fontSize={'14px'}
              sx={{
                overflowWrap: 'break-word',
              }}
            >
              {`Click on "Allow access to file URLs" at `}
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
              {` to `}
            </Typography>
            <Typography
              width={0}
              flex={1}
              color={'rgba(255,255,255,0.85)'}
              fontSize={'14px'}
              sx={{
                // overflowWrap: 'break-word',
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {` view ${dataUrl}`}
            </Typography>
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
                height: '48px',
                backgroundColor: '#fff',
                color: '#7602d3',
                fontSize: '14px',
                mt: '12px !important',
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#7602d3',
                },
              }}
            >
              Allow access to file URLs
            </Button>
          </Stack>
          <Divider
            sx={{
              color: '#fff',
            }}
          >
            OR
          </Divider>
          <Typography
            component={'div'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
            color={'rgba(255,255,255,0.85)'}
            fontSize={'12px'}
          >
            <span> {`select the file again:`}</span>
            <Button
              disableElevation
              size={'small'}
              variant={'contained'}
              onClick={(event) => {
                event.preventDefault()
                ;(
                  document.querySelector('#openFile') as HTMLButtonElement
                )?.click()
              }}
              sx={{
                height: '24px',
                backgroundColor: '#636363',
                color: 'rgba(255,255,255,0.87)',
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#636363',
                  color: 'rgba(255,255,255,0.87)',
                },
              }}
            >
              Choose file
            </Button>
          </Typography>
          <Divider
            sx={{
              color: '#fff',
            }}
          >
            OR
          </Divider>
          <Typography
            flex={1}
            color={'rgba(255,255,255,0.85)'}
            fontSize={'14px'}
            sx={{
              overflowWrap: 'break-word',
            }}
          >
            {`Turn off "PDF AI viewer" at any time on the extension's `}
            <Link
              color={'rgba(255,255,255,1)'}
              href={'#'}
              onClick={async (event) => {
                event.preventDefault()
                event.stopPropagation()
                await chromeExtensionClientOpenPage({
                  key: 'options',
                  query: '#pdf',
                })
              }}
            >
              Settings page
            </Link>
            {'.'}
          </Typography>
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
const disabledPDFViewer = () => {
  console.log(window.location.href)
  if (window.location.href.startsWith('chrome-extension://')) {
    if (window.location.href.includes('/pages/pdf/web/viewer.html')) {
      if (document.body.querySelector('#usechatgpt-disabled-pdf')) {
        return
      }
      if (
        window.localStorage.getItem('hide_usechatgptai_pdf_alert') === 'true'
      ) {
        return
      }
      const DisableTooltip = (
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
                  PDF AI viewer
                </Typography>
              </Stack>
              <Typography fontSize={14}>
                {`PDF AI viewer lets you select text in any PDF files and use
                prompts on them. You can turn it off at any time on the
                extension's `}
                <Link
                  href={'#'}
                  onClick={async (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    await chromeExtensionClientOpenPage({
                      key: 'options',
                      query: '#pdf',
                    })
                  }}
                >
                  Settings page
                </Link>
                {`.`}
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
                  document.body
                    .querySelector('#usechatgpt-disabled-pdf')
                    ?.remove()
                }}
              >
                Got it
              </Button>
            </Stack>
          </CloseAlert>
        </Box>
      )
      // append to body
      const root = document.createElement('div')
      document.body.appendChild(root)
      render(DisableTooltip, root)
    }
  }
}

const AppInit = () => {
  const appState = useRecoilValue(AppState)
  useInitChatGPTClient()
  useAuthLogin()
  useEffectOnce(() => {
    disabledPDFViewer()
  })
  useInjectShortCutsRunTime()
  useHandlePDFViewerError()
  return (
    <>
      {appState.env === 'gmail' && isEzMailApp && <GmailInit />}
      {!isEzMailApp && <RangyInit />}
      <RangyContextMenu />
      <ForceUpdateContextMenuReadOnlyOption />
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
