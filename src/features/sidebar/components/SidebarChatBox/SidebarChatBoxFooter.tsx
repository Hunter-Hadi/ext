import React, { FC, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { CHROME_EXTENSION_MAIL_TO } from '@/constants'
import SidebarChatBoxReleaseLog from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxReleaseLog'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'react-i18next'
import useWindowSize from '@/hooks/useWindowSize'
import isNumber from 'lodash-es/isNumber'
import { UAParser } from 'ua-parser-js'
const { getOS } = new UAParser()
const SidebarChatBoxFooter: FC = () => {
  const { width, scrollWidth } = useWindowSize()
  const { t } = useTranslation(['common'])
  const [needSafePadding, setNeedSafePadding] = useState(false)
  useEffect(() => {
    if (isNumber(scrollWidth) && isNumber(width) && scrollWidth > width) {
      // check is mac
      if (getOS().name === 'Mac OS') {
        // 因为mac没有滚动条高度
        return
      }
      setNeedSafePadding(true)
    }
  }, [width, scrollWidth])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{ width: '100%' }}
      spacing={2}
      justifyContent={'space-between'}
      pb={needSafePadding ? 2 : 0}
    >
      <Typography sx={{ flexShrink: 0 }} fontSize={12}>
        <Link
          color={'text.primary'}
          sx={{ cursor: 'pointer' }}
          underline={'always'}
          target={'_blank'}
          href={CHROME_EXTENSION_MAIL_TO}
        >
          {t('common:contact_us')}
        </Link>
      </Typography>
      <SidebarChatBoxReleaseLog />
    </Stack>
  )
}
export default SidebarChatBoxFooter
