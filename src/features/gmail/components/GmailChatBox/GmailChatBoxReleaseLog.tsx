import React, { FC } from 'react'
import Typography from '@mui/material/Typography'
import { APP_VERSION } from '@/constants'
// import Link from '@mui/material/Link'

const GmailChatBoxReleaseLog: FC = () => {
  const ReleaseLogText = `New prompts: Write & Draft with AI.`
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
        {`UseChatGPT.AI v${APP_VERSION} - ${ReleaseLogText}`}
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
