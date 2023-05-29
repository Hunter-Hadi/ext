import React, { useState, FC, useMemo } from 'react'
import { UAParser } from 'ua-parser-js'
import { sendLarkBotMessage } from '@/utils/larkBot'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import useEffectOnce from '@/hooks/useEffectOnce'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { BrowserIcon } from '@/components/CustomIcon'
import { chromeExtensionClientOpenPage } from '@/utils'

const { getBrowser } = new UAParser()

const BrowserVersionDetector: FC<{
  children?: React.ReactNode
}> = (props) => {
  const [browserName, setBrowserName] = useState<any>(null)
  const [browserVersion, setBrowserVersion] = useState<any>(null)
  const [isCompatible, setIsCompatible] = useState<any>(true)
  const updateBrowserLink = useMemo(() => {
    if (!browserName) {
      return ''
    }
    if (browserName === 'Chrome') {
      return 'chrome://settings/help'
    }
    if (browserName === 'Edge') {
      return 'edge://settings/help'
    }
    if (browserName === 'Chromium') {
      return 'https://download-chromium.appspot.com/'
    }
    if (browserName === 'Opera') {
      return 'opera://about'
    }
    if (browserName === 'Firefox') {
      return 'https://support.mozilla.org/en-US/kb/update-firefox-latest-release'
    }
    if (browserName === 'Safari') {
      return 'https://support.apple.com/en-us/HT204416'
    }
    return ''
  }, [browserName])
  useEffectOnce(() => {
    const browser = getBrowser()
    setBrowserName(browser.name)
    setBrowserVersion(browser.version)
    const version = Number(browser.version?.match(/\d+/)?.[0] || '')
    let currentIsCompatible = true
    if (version === 0) {
      return
    }
    // chrome 103
    if (browser.name === 'Chrome' && version < 103) {
      currentIsCompatible = false
    }
    // edge 103
    if (browser.name === 'Edge' && version < 103) {
      currentIsCompatible = false
    }

    setIsCompatible(currentIsCompatible)
    if (!currentIsCompatible) {
      getChromeExtensionOnBoardingData().then(async (data) => {
        if (data.ON_BOARDING_RECORD_BROWSER_VERSION) {
          return
        }
        await sendLarkBotMessage(
          '[Browser] Browser version is not compatible',
          `Browser: [${browser.name}]\nVersion: [${browser.version}]`,
          { uuid: 'dd385931-45f4-4de1-8e48-8145561b0f9d' },
        )
        await setChromeExtensionOnBoardingData(
          'ON_BOARDING_RECORD_BROWSER_VERSION',
          true,
        )
      })
    }
  })
  if (!browserName || !browserVersion || isCompatible) {
    return <>{props.children}</>
  }
  return (
    <Stack
      sx={{
        mx: 'auto',
        px: 1,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 400,
      }}
      spacing={2}
    >
      <BrowserIcon sx={{ color: 'text.primary', fontSize: '88px' }} />
      <Typography fontSize={'26px'} fontWeight={800} color={'text.primary'}>
        {`Update your ${browserName} browser`}
      </Typography>
      <Typography
        textAlign={'center'}
        fontSize={'16px'}
        color={'text.primary'}
      >{`In order to use this extension, please update your browser to the latest version. Your current browser version is not compatible.`}</Typography>
      <Link
        underline={'none'}
        href={'#'}
        target={'_blank'}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          sendLarkBotMessage(
            '[Browser] Browser clicked update',
            `Browser: [${browserName}]\nVersion: [${browserVersion}]`,
            { uuid: 'dd385931-45f4-4de1-8e48-8145561b0f9d' },
          )
          chromeExtensionClientOpenPage({
            url: updateBrowserLink,
          })
        }}
      >
        <Button
          sx={{
            height: '48px',
            fontSize: '16px',
            borderRadius: '24px',
          }}
          variant={'contained'}
          color={'primary'}
        >{`Update ${browserName} browser`}</Button>
      </Link>
    </Stack>
  )
}
export default BrowserVersionDetector
