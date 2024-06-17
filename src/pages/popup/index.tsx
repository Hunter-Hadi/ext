import '@/i18n'

import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { RecoilRoot, useSetRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { backgroundSendClientMessage } from '@/background/utils'
import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import AppThemeProvider from '@/components/AppTheme'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TooltipButton from '@/components/TooltipButton'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useInitI18n } from '@/i18n/hooks'
import EnablePDFButton from '@/pages/popup/components/EnablePDFButton'
import EnablePDFContent from '@/pages/popup/components/EnablePDFContent'
import { AppDBStorageState } from '@/store'
import { chromeExtensionClientOpenPage } from '@/utils'

import BulletList from '../../components/BulletList'
// import { backgroundSendClientMessage } from '@/background/utils'

const root = createRoot(document.getElementById('root') as HTMLDivElement)
const App: FC<{
  isSpecialPage: boolean
  isPDFPage: boolean
}> = (props) => {
  const updateAppSettings = useSetRecoilState(AppDBStorageState)
  const { isSpecialPage, isPDFPage } = props
  useInitI18n()
  const { t } = useTranslation(['common', 'client'])
  const [shortCutKey, setShorCutKey] = useState('')
  const [currentTabId, setCurrentTabId] = useState<number | undefined>()
  const init = async () => {
    const commands = (await Browser.commands.getAll()) || []
    setShorCutKey(
      commands.find((command) => command.name === '_execute_action')
        ?.shortcut || 'unset',
    )
    const tabs = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (tabs && tabs[0]) {
      setCurrentTabId(tabs[0].id)
    }
  }
  useEffectOnce(() => {
    init()
    getLiteChromeExtensionDBStorage().then(updateAppSettings)
  })

  const renderContent = () => {
    if (isPDFPage) {
      return <EnablePDFContent tabId={currentTabId} />
    }

    if (isSpecialPage) {
      return (
        <Alert severity={'info'}>
          <Typography fontSize={14} color={'text.primary'} mb={1}>
            {t('client:popup__special_page__title')}
          </Typography>
          <BulletList
            textProps={{
              fontSize: 14,
            }}
            textList={[
              t('client:popup__special_page__item1'),
              t('client:popup__special_page__item2'),
              t('client:popup__special_page__item3'),
            ]}
          />
        </Alert>
      )
    }

    return (
      <Alert severity={'info'}>
        <Typography fontSize={14} color={'text.primary'}>
          {t('client:popup__refresh_page__title')}
        </Typography>
      </Alert>
    )
  }

  const renderButton = () => {
    if (isPDFPage) {
      return <EnablePDFButton tabId={currentTabId} />
    }
    if (!isSpecialPage) {
      return (
        <Button
          fullWidth
          color={'primary'}
          variant={'contained'}
          startIcon={<RefreshIcon sx={{ fontSize: 16, color: 'inherit' }} />}
          sx={{ borderRadius: '8px', p: 1, fontSize: 16, fontWeight: 600 }}
          onClick={async () => {
            if (currentTabId) {
              await Browser.tabs.reload(currentTabId)
              window.close()
            }
          }}
        >
          {t('client:popup__refresh_page__button')}
        </Button>
      )
    }

    return null
  }

  return (
    <Stack minWidth={400} sx={{ bgcolor: 'background.paper' }}>
      {/* header */}
      <Stack
        boxSizing={'border-box'}
        direction={'row'}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
        p={2}
        pb={1.5}
      >
        <Link
          sx={{
            flexShrink: 0,
            textDecoration: 'none!important',
          }}
          href={APP_USE_CHAT_GPT_HOST}
          target={'_blank'}
        >
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <UseChatGptIcon
              sx={{
                fontSize: 28,
                color: 'inherit',
              }}
            />
            <Typography
              color='text.primary'
              component='h1'
              fontSize={20}
              fontWeight={800}
            >
              {t('client:popup__title')}
            </Typography>
          </Stack>
        </Link>
        <TooltipButton
          title={t('common:settings')}
          size={'small'}
          variant={'text'}
          sx={{
            width: 32,
            height: 32,
            color: 'inherit',
            minWidth: 'unset',
          }}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            chromeExtensionClientOpenPage({
              key: 'options',
            })
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 22, color: 'text.primary' }} />
        </TooltipButton>
      </Stack>

      <Divider />

      {/* body */}
      <Stack spacing={2} p={2} pb={0} maxHeight={360} overflow='auto'>
        {renderContent()}
      </Stack>

      {/* footer */}
      <Stack spacing={2} p={2}>
        {renderButton()}

        <Typography fontSize={14} color={'text.secondary'}>
          <span>{`${t('client:popup__set_shortcut__description1')} `}</span>
          <Box
            sx={{
              p: '0 4px',
              display: 'inline-block',
              minWidth: '40px',
              textAlign: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.16)',
              borderRadius: '4px',
              color: 'text.primary',
            }}
            component={'span'}
          >
            {shortCutKey}
          </Box>
          <span>{` ${t('client:popup__set_shortcut__description2')} `}</span>
          <Link
            href={'#'}
            onClick={async () => {
              await chromeExtensionClientOpenPage({ key: 'shortcuts' })
            }}
          >
            {t('client:popup__set_shortcut__description3')}
          </Link>
          <span>{` ${t('client:popup__set_shortcut__description4')}`}</span>
        </Typography>
      </Stack>
    </Stack>
  )
}

const init = async () => {
  // hide popup
  const currentTab = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  setTimeout(async () => {
    let isSpecialPage = false
    let isPDFPage = false
    try {
      const tabId = currentTab && currentTab[0] && currentTab[0].id
      const tabUrl =
        (currentTab && currentTab[0] && currentTab[0].url) || 'chrome://'
      isSpecialPage =
        tabUrl.startsWith('chrome') ||
        tabUrl.startsWith('https://chrome.google.com/webstore') ||
        tabUrl.startsWith('https://chromewebstore.google.com')
      isPDFPage = tabUrl.startsWith('file') && tabUrl.endsWith('.pdf')
      if (isSpecialPage) {
        if (
          tabUrl.includes('pages/pdf/web') &&
          tabUrl.includes(Browser.runtime.id)
        ) {
          // pdf page
        } else {
          throw new Error('isSpecialPage')
        }
      }

      if (tabId) {
        await Browser.tabs.sendMessage(tabId, {})
        const result = await backgroundSendClientMessage(
          tabId,
          'Client_listenOpenChatMessageBox',
          {
            type: 'shortcut',
          },
        )
        if (result) {
          Browser.action.setPopup({
            popup: '',
          })
          window.close()
        } else {
          throw new Error('no result')
        }
      }
    } catch (e) {
      if (isSpecialPage) {
        chromeExtensionClientOpenPage({
          url: Browser.runtime.getURL(`/pages/chat/index.html`),
        })
        return
      }
      console.log(e)
      root.render(
        <React.StrictMode>
          <RecoilRoot>
            <AppThemeProvider>
              <App isSpecialPage={isSpecialPage} isPDFPage={isPDFPage} />
            </AppThemeProvider>
          </RecoilRoot>
        </React.StrictMode>,
      )
    } finally {
      Browser.action.setBadgeText({
        text: '',
      })
    }
  }, 100)
}
init()
