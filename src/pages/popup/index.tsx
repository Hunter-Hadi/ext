import { createRoot } from 'react-dom/client'
import React, { FC, useState } from 'react'
import Stack from '@mui/material/Stack'
import { APP_USE_CHAT_GPT_HOST } from '@/types'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import TooltipButton from '@/components/TooltipButton'
import { chromeExtensionClientOpenPage } from '@/utils'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Link from '@mui/material/Link'
import { RecoilRoot } from 'recoil'
import AppThemeProvider from '@/components/AppTheme'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import RefreshIcon from '@mui/icons-material/Refresh'
import Browser from 'webextension-polyfill'
import Box from '@mui/material/Box'
import useEffectOnce from '@/hooks/useEffectOnce'

const root = createRoot(document.getElementById('root') as HTMLDivElement)
const App: FC = () => {
  const [shortCutKey, setShorCutKey] = useState('')
  const [currentTabId, setCurrentTabId] = useState<number | undefined>()
  const [isSpecialPage, setIsSpecialPage] = useState(false)
  useEffectOnce(() => {
    async function init() {
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
        const url = tabs[0].url || 'chrome://'
        if (
          url.startsWith('chrome') ||
          url.startsWith('https://chrome.google.com/webstore')
        ) {
          setIsSpecialPage(true)
          return
        }
        setCurrentTabId(tabs[0].id)
      }
    }
    init()
  })
  return (
    <Stack minWidth={400}>
      <p>{isSpecialPage}</p>
      <Stack
        boxSizing={'border-box'}
        direction={'row'}
        p={1}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
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
              color="text.primary"
              component="h1"
              fontSize={20}
              fontWeight={800}
            >
              {String(process.env.APP_NAME)}
            </Typography>
          </Stack>
        </Link>
        <TooltipButton
          title={'Settings'}
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
          <SettingsOutlinedIcon sx={{ fontSize: 16, color: 'text.primary' }} />
        </TooltipButton>
      </Stack>
      <Stack spacing={1}>
        <Typography fontSize={18} fontWeight={600} color={'text.primary'}>
          Welcome to UseChatGPT.AI!
        </Typography>
        <Typography fontSize={14} color={'text.primary'}>
          Refresh this page to activate the extension and the Cmd/Alt+J shortcut
          on this page.
        </Typography>
        <Button
          fullWidth
          color={'primary'}
          variant={'contained'}
          startIcon={<RefreshIcon sx={{ fontSize: 16, color: 'inherit' }} />}
          onClick={async () => {
            if (currentTabId) {
              await Browser.tabs.reload(currentTabId)
            }
          }}
        >
          Refresh this page
        </Button>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack p={1}>
        <Typography fontSize={14} color={'text.secondary'}>
          <span>{`Tips: Press `}</span>
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
          <span>
            {` to activate Monica faster. Keyboard shortcut can be changed `}
          </span>
          <Link
            href={'#'}
            onClick={async () => {
              await chromeExtensionClientOpenPage({ key: 'shortcuts' })
            }}
          >
            here
          </Link>
          <span>{`.`}</span>
        </Typography>
      </Stack>
    </Stack>
  )
}
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
)
