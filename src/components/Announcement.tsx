import { CHROME_EXTENSION_HOMEPAGE_URL } from '@/constants'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import useEffectOnce from '@/hooks/useEffectOnce'
import Browser from 'webextension-polyfill'

const TWEET_URL = 'https://twitter.com/MaxAI_HQ'

const REBRAND_ANNOUNCEMENT_HIDDEN_SAVE_KEY =
  'REBRAND_ANNOUNCEMENT_HIDDEN_SAVE_KEY_1952'

const Announcement = () => {
  const [loaded, setLoaded] = useState(false)
  const [hide, setHide] = useState(false)

  const updateFlag = async (flag: boolean) => {
    setHide(flag)
    await Browser.storage.local.set({
      [REBRAND_ANNOUNCEMENT_HIDDEN_SAVE_KEY]: flag,
    })
  }

  useEffectOnce(() => {
    Browser.storage.local
      .get(REBRAND_ANNOUNCEMENT_HIDDEN_SAVE_KEY)
      .then((result) => {
        setHide(result[REBRAND_ANNOUNCEMENT_HIDDEN_SAVE_KEY])
        setLoaded(true)
      })
  })

  if (!loaded || hide) return null

  return (
    <Stack
      direction="row"
      bgcolor="#DDB1FF"
      p={1}
      alignItems="center"
      fontSize={16}
      color="rgba(0,0,0,0.87)"
    >
      <Link
        sx={{
          color: 'inherit',
          textDecoration: 'underline!important',
          mr: 0.5,
        }}
        href={'https://www.usechatgpt.ai'}
        target={'_blank'}
      >
        <Typography variant="caption" fontSize={16} fontWeight={500}>
          UseChatGPT.AI
        </Typography>
      </Link>
      is now
      <Link
        sx={{
          color: 'inherit',
          textDecoration: 'underline!important',
          ml: 0.5,
        }}
        href={CHROME_EXTENSION_HOMEPAGE_URL}
        target={'_blank'}
      >
        <Typography variant="caption" fontSize={16} fontWeight={500}>
          MaxAI.me
        </Typography>
      </Link>
      . 🎉
      <Button
        variant="outlined"
        color="inherit"
        href={TWEET_URL}
        target={'_blank'}
        sx={{
          ml: 'auto !important',
          color: 'inherit',
          borderColor: 'inherit',
        }}
      >
        Read More
      </Button>
      <IconButton
        sx={{ flexShrink: 0, ml: 1, color: 'inherit' }}
        onClick={() => updateFlag(true)}
      >
        <CloseIcon sx={{ fontSize: '24px' }} />
      </IconButton>
    </Stack>
  )
}

export default Announcement
