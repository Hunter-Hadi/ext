import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import isNumber from 'lodash-es/isNumber'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'

import { CHROME_EXTENSION_MAIL_TO } from '@/constants'
import useWindowSize from '@/features/common/hooks/useWindowSize'
import SidebarChatBoxReleaseLog from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxReleaseLog'
const { getOS } = new UAParser()
const SidebarChatBoxFooter: FC = () => {
  return null

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
          color={'text.secondary'}
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
