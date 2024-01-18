import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'

const SidebarAIMessageDownloadButton: FC<{
  downloadUrl: string
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { downloadUrl } = props
  return (
    <TooltipIconButton
      title={t('common:download')}
      onClick={() => {
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'download'
        a.click()
        a.remove()
      }}
    >
      <ContextMenuIcon icon={'FileDownload'} sx={{ fontSize: '20px' }} />
    </TooltipIconButton>
  )
}

export default SidebarAIMessageDownloadButton
