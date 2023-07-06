import React, { FC } from 'react'
import Typography from '@mui/material/Typography'
import { APP_VERSION, RELEASE_LOG_URL } from '@/constants'
// import Link from '@mui/material/Link'
import Link from '@mui/material/Link'

const GmailChatBoxReleaseLog: FC = () => {
  const ReleaseLogText = `Write & Draft with AI in any doc or text box.`
  return (
    <Typography
      width={'100%'}
      component={'div'}
      fontSize={12}
      color={'text.secondary'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
      }}
    >
      <Typography
        fontSize={'inherit'}
        color={'inherit'}
        width={0}
        flex={1}
        textAlign={'right'}
        noWrap
      >
        <Link
          fontSize={'inherit'}
          color={'inherit'}
          href={RELEASE_LOG_URL}
          target="_blank"
          sx={{
            textDecoration: 'underline!important',
          }}
        >
          {`MaxAI.me v${APP_VERSION} - ${ReleaseLogText}`}
        </Link>
      </Typography>
      {/*<Link*/}
      {/*  sx={{*/}
      {/*    flexShrink: 0,*/}
      {/*    color: 'text.secondary',*/}
      {/*  }}*/}
      {/*  href={`${CHROME_EXTENSION_HOMEPAGE_URL}/update`}*/}
      {/*>*/}
      {/*  <Typography*/}
      {/*    fontSize={'inherit'}*/}
      {/*    color={'inherit'}*/}
      {/*    width={0}*/}
      {/*    flex={1}*/}
      {/*    noWrap*/}
      {/*  >*/}
      {/*    ChatGPT may produce inaccurate information about people, places, or*/}
      {/*    facts.*/}
      {/*  </Typography>*/}
      {/*</Link>*/}
    </Typography>
  )
}
export default GmailChatBoxReleaseLog
